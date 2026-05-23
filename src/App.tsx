import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const [updateAvailable, setUpdateAvailable] = useState<Update | null>(null);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateError, setUpdateError] = useState("");
  const [upToDate, setUpToDate] = useState(false);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  async function checkForUpdates() {
    setChecking(true);
    setUpdateError("");
    setUpToDate(false);
    try {
      const update = await check();
      if (update) {
        setUpdateAvailable(update);
      } else {
        setUpToDate(true);
      }
    } catch (e) {
      setUpdateError(`Failed to check for updates: ${e}`);
    } finally {
      setChecking(false);
    }
  }

  async function installUpdate() {
    if (!updateAvailable) return;
    setUpdating(true);
    setDownloadProgress(0);
    try {
      let totalLength = 0;
      let downloaded = 0;
      await updateAvailable.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            totalLength = event.data.contentLength ?? 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (totalLength > 0) {
              setDownloadProgress(Math.round((downloaded / totalLength) * 100));
            }
            break;
          case "Finished":
            setDownloadProgress(100);
            break;
        }
      });
      await relaunch();
    } catch (e) {
      setUpdateError(`Failed to install update: ${e}`);
      setUpdating(false);
    }
  }

  useEffect(() => {
    checkForUpdates();
  }, []);

  return (
    <main className="container">
      {/* Update Banner */}
      {updateAvailable && (
        <div className="update-banner">
          <div className="update-info">
            <span className="update-icon">&#x2B06;</span>
            <span>
              Update <strong>{updateAvailable.version}</strong> is available!
            </span>
          </div>
          {updating ? (
            <div className="update-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <span className="progress-text">{downloadProgress}%</span>
            </div>
          ) : (
            <button className="update-btn" onClick={installUpdate}>
              Install & Restart
            </button>
          )}
        </div>
      )}

      {updateError && (
        <div className="update-banner update-error">
          <span>{updateError}</span>
          <button className="update-btn dismiss-btn" onClick={() => setUpdateError("")}>
            Dismiss
          </button>
        </div>
      )}

      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      {/* Update Check Section */}
      <div className="update-section">
        <button
          className="check-update-btn"
          onClick={checkForUpdates}
          disabled={checking}
        >
          {checking ? "Checking..." : "Check for Updates"}
        </button>
        {upToDate && <p className="up-to-date">You're on the latest version.</p>}
      </div>
    </main>
  );
}

export default App;
