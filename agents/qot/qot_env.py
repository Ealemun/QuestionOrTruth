import numpy as np
import requests
from gymnasium import spaces, Env # type: ignore
# from gym.spaces import Dict, Discrete, MultiDiscrete, Box
from itertools import combinations

NUM_QUESTIONS = 97
RESPONSE_VEC_SIZE = 105  # 97 + 1 + 7
HISTORY_LIMIT = 10

# Precompute all valid position combinations for SUM-positions encoding
ALL_POSITION_COMBOS = list(combinations(range(8), 3))

class QOTEnv(Env):
    def __init__(self, base_url="http://localhost:3002"):
        super().__init__()
        self.base_url = base_url

        self.observation_space = spaces.Dict({
            "phase": spaces.Discrete(4),  # 0: SETUP, 1: BETTING, 2: RESOLUTION, 3: END
            "chips": spaces.Box(low=0, high=np.inf, shape=(1,), dtype=np.float32),
            "receivedInfo": spaces.Box(low=0.0, high=1.0, shape=(HISTORY_LIMIT, RESPONSE_VEC_SIZE), dtype=np.float32),
        })

        self.setup_space = spaces.MultiDiscrete([13] * 8 + [4] * 8)  # values + suits
        self.bet_space = spaces.Discrete(21)  # max bid of 20 (adjust as needed)
        self.claim_space = spaces.MultiDiscrete([13] * 8)  # only values guessed

        self.action_space = self.setup_space  # initial phase
        self._phase = "SETUP"
        self._last_obs = None

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self._phase = "SETUP"

        obs = self._post("/reset", {})
        self._last_obs = obs

        processed = self._process_obs(obs)
        return processed, {}

    def step(self, action):
        # print("\n\n\n\n Voici l'action choisie", action, "\n\n\n")
        if self._phase == "SETUP":
            values = action[:8]
            suits = action[8:]
            cards = self._decode_cards(values, suits)
            payload = {
            "player": "Alice",
            "action": cards
            }
        elif self._phase == "BETTING":
            payload = {"action_type": "bet", "amount": int(action)}
        elif self._phase == "RESOLUTION":
            payload = {"action_type": "truth", "values": [int(x) for x in action]}
        else:
            raise ValueError(f"Invalid phase: {self._phase}")

        try:
            # print("\n\n\n\n Voici le résultat envoyé", payload, "\n\n\n")
            result = self._post("/step", payload)
            obs = self._process_obs(result)
            reward = float(result.get("reward", 0))
            done = bool(result.get("done", False))
            info = result.get("info", {})

            self._last_obs = result
            self._phase = info.get("phase", self._phase)
            self._update_action_space()
            return obs, reward, done, False, info

        except Exception as e:
            # print(f"[ERROR] Server error or invalid input: {e}")
            dummy_obs = self._process_obs(self._last_obs)
            return dummy_obs, -1000.0, True, False, {"error": str(e)}
        
    def _decode_cards(self, values, suits):
        suit_map = ["spades", "hearts", "diamonds", "clubs"]
        cards = []
        for rank, suit_idx in zip(values, suits):
            suit = str(suit_map[int(suit_idx) % 4])
            card = {"rank": int(rank + 1), "suit": suit}
            cards.append(card)
        return cards


    def _update_action_space(self):
        if self._phase == "SETUP":
            self.action_space = self.setup_space
        elif self._phase == "BETTING":
            self.action_space = self.bet_space
        elif self._phase == "CLAIM":
            self.action_space = self.claim_space
        else:
            self.action_space = spaces.Discrete(1)

    def _post(self, path, payload):
        url = f"{self.base_url}{path}"
        response = requests.post(url, json=payload)
        if response.status_code != 200:
            raise ValueError(response.json().get("error", "Unknown server error"))
        return response.json()

    def _process_obs(self, raw_obs):
        phase = raw_obs.get("phase", 0)
        chips = np.array([float(raw_obs.get("chips", 0))], dtype=np.float32)
        info_history = raw_obs.get("receivedInfo", [])[-HISTORY_LIMIT:]

        encoded_history = np.zeros((HISTORY_LIMIT, RESPONSE_VEC_SIZE), dtype=np.float32)
        for i, info in enumerate(info_history):
            encoded_history[i] = self._encode_response(info)

        return {
            "phase": phase,
            "chips": chips,
            "receivedInfo": encoded_history
        }

    def _encode_response(self, response):
        vec = np.zeros(RESPONSE_VEC_SIZE, dtype=np.float32)

        question = response["question"]
        q_index = self._question_to_index(question)
        vec[q_index] = 1

        if "value" in response:
            vec[97] = float(response["value"]) / 104.0
        elif "positions" in response:
            for pos in response["positions"]:
                if 0 <= pos < 7:
                    vec[98 + pos] = 1.0

        return vec

    def _question_to_index(self, q):
        if q["type"] == 'SUM' and q.get("variant") == 'positions':
            positions = tuple(sorted(q["positions"]))
            return ALL_POSITION_COMBOS.index(positions)

        type_map = {
            ('SUM', 'color'): 56,
            ('SUM', 'figures'): 60,
            ('SUM', 'numerical'): 61,
            ('COUNT', 'figures'): 62,
            ('COUNT', 'numerical'): 63,
            ('POSITION', 'consecutive'): 64,
            ('POSITION', 'max'): 65,
            ('POSITION', 'min'): 66
        }

        if q["type"] == 'COUNT' and q.get("variant") == 'value':
            return 67 + q["rank"]
        if q["type"] == 'POSITION' and q.get("variant") == 'value':
            return 80 + q["rank"]
        if q["type"] == 'POSITION' and q.get("variant") == 'color':
            return 93 + q["suit"]
        if q["type"] == 'SUM' and q.get("variant") == 'color':
            return 56 + q["suit"]

        return type_map.get((q["type"], q.get("variant")), 0)
