import os
from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from stable_baselines3.common.vec_env import SubprocVecEnv, VecMonitor
from stable_baselines3.common.callbacks import CheckpointCallback
from qot_env import QOTEnv

def make_env(port):
    def _init():
        env = QOTEnv(base_url=f"http://localhost:{port}")
        check_env(env, warn=True)  # Optionnel, à garder pour debug
        return env
    return _init

def main():
    NUM_ENVS = 6
    START_PORT = 3003

    # --- Setup des dossiers ---
    model_dir = "agents/qot/saved_models"
    log_dir = "agents/qot/logs/ppo_tensorboard"
    checkpoint_dir = os.path.join(model_dir, "checkpoints")
    final_model_path = os.path.join(model_dir, "qot_ppo")

    os.makedirs(checkpoint_dir, exist_ok=True)

    # --- Callback de sauvegarde ---
    checkpoint_callback = CheckpointCallback(
        save_freq=1_000,
        save_path=checkpoint_dir,
        name_prefix="ppo_qot_checkpoint",
        save_replay_buffer=True,
        save_vecnormalize=True,
    )

    # --- Parallélisation des environnements ---
    env = SubprocVecEnv([make_env(START_PORT + i) for i in range(NUM_ENVS)])
    env = VecMonitor(env)

    # --- Chargement modèle existant ou nouveau ---
    latest_checkpoint = None
    for f in sorted(os.listdir(checkpoint_dir), reverse=True):
        if f.endswith(".zip"):
            latest_checkpoint = os.path.join(checkpoint_dir, f)
            break

    if latest_checkpoint:
        print(f"🔁 Reprise depuis le checkpoint : {latest_checkpoint}")
        model = PPO.load(latest_checkpoint, env=env, verbose=1, tensorboard_log=log_dir)
    elif os.path.exists(final_model_path + ".zip"):
        print(f"🔁 Reprise depuis le modèle final : {final_model_path}")
        model = PPO.load(final_model_path, env=env, verbose=1, tensorboard_log=log_dir)
    else:
        print("🆕 Nouveau modèle créé.")
        model = PPO(
            "MultiInputPolicy",
            env,
            verbose=1,
            tensorboard_log=log_dir,
            n_steps=32,  # Apprentissage rapide des erreurs
            batch_size=16
        )

    # --- Entraînement ---
    model.learn(
        total_timesteps=100_000,
        callback=checkpoint_callback,
        tb_log_name="PPO_QOT"
    )

    # --- Sauvegarde finale ---
    model.save(final_model_path)
    print("✅ Modèle final sauvegardé.")

if __name__ == "__main__":
    main()
