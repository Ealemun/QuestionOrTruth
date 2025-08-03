import os
from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from stable_baselines3.common.vec_env import SubprocVecEnv, VecMonitor
from stable_baselines3.common.callbacks import CheckpointCallback
from qot_env import QOTEnv
from stable_baselines3.common.monitor import Monitor

def make_env():
    def _init():
        env = QOTEnv()
        env = Monitor(env)  # Monitor pour stable_baselines3
        # Optionnel : env = RecordEpisodeStatistics(env)  # si tu veux logger stats Gymnasium
        check_env(env, warn=True)
        return env
    return _init

def main():
    NUM_ENVS = 6
    # START_PORT = 3003
    print("Start of the main\n\n\n\n")
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
    # env = SubprocVecEnv([make_env(START_PORT + i) for i in range(NUM_ENVS)])
    # env = VecMonitor(env)
    print("Before env creation\n\n\n\n")
    env = SubprocVecEnv([make_env() for _ in range(NUM_ENVS)])
    env = VecMonitor(env)
    # print("Env created\n\n\n\n")

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
            n_steps=32,#2048,  # Apprentissage rapide des erreurs
            batch_size=16#64
        )

    # --- Entraînement ---
    model.learn(
        total_timesteps=1_00,
        callback=checkpoint_callback,
        tb_log_name="PPO_QOT",
        progress_bar=True
    )

    # --- Sauvegarde finale ---
    model.save(final_model_path)
    print("✅ Modèle final sauvegardé.")

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.set_start_method("spawn", force=True)
    main()
