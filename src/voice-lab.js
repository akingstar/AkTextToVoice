(() => {
  const mount = () => {
    if (document.getElementById("ak-voice-lab")) return;

    const host = document.createElement("section");
    host.id = "ak-voice-lab";
    host.style.cssText = "max-width:900px;margin:35px auto;padding:20px;color:#fff";
    document.body.appendChild(host);

    const root = host.attachShadow({mode:"open"});
    root.innerHTML = `
      <style>
        *{box-sizing:border-box}
        .panel{background:#171426;border:1px solid #40345c;
        border-radius:18px;padding:22px;font-family:Arial,sans-serif}
        h2{color:#c7a7ff;margin-top:0}
        p{color:#c9c2d8;line-height:1.5}
        input,textarea{width:100%;padding:12px;margin:8px 0;
        border-radius:9px;border:1px solid #574879;background:#211b33;color:white}
        button{padding:12px 17px;margin:7px 5px 7px 0;border:0;
        border-radius:9px;background:#8254d8;color:white;font-weight:bold}
        button:disabled{opacity:.4}
        .stop{background:#b43d65}
        .sample{padding:12px;border-bottom:1px solid #40345c}
        small{color:#b9a9d2}
      </style>
      <div class="panel">
        <h2>🎙️ AK ADVANCED VOICE LAB</h2>
        <p>Record your own voice samples. Use a quiet room and speak naturally.
        Only record voices you own or have permission to use.</p>
        <input id="speaker" placeholder="Voice name (e.g. My Voice)" value="My Voice">
        <textarea id="script" rows="3" placeholder="What are you going to say?">नमस्ते, यह मेरी आवाज़ का पहला training sample है।</textarea>
        <button id="start">● Start Recording</button>
        <button id="stop" class="stop" disabled>■ Stop Recording</button>
        <button id="manifest">Export Dataset Manifest</button>
        <p id="status">Ready. Allow microphone permission to begin.</p>
        <h3>Recorded Samples: <span id="count">0</span></h3>
        <div id="samples"></div>
      </div>`;

    const $ = id => root.getElementById(id);
    let recorder = null;
    let stream = null;
    let chunks = [];
    let samples = [];

    $("start").onclick = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
          throw new Error("This browser does not support microphone recording. Try Chrome over HTTPS.");
        }
        stream = await navigator.mediaDevices.getUserMedia({audio:true});
        const options = {};
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options.mimeType = "audio/webm;codecs=opus";
        }
        recorder = new MediaRecorder(stream, options);
        chunks = [];
        recorder.ondataavailable = e => {
          if (e.data.size) chunks.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks, {type:recorder.mimeType || "audio/webm"});
          if (blob.size < 1000) {
            $("status").textContent = "Recording too short. Please try again.";
            return;
          }
          const index = samples.length + 1;
          const name = `voice-sample-${String(index).padStart(3,"0")}.webm`;
          const url = URL.createObjectURL(blob);
          samples.push({
            name, blob, url,
            text:$("script").value.trim(),
            speaker:$("speaker").value.trim() || "My Voice",
            created:new Date().toISOString(),
            mime:blob.type
          });
          render();
          $("status").textContent = `Saved ${name} (${blob.size} bytes).`;
        };
        recorder.start();
        $("start").disabled = true;
        $("stop").disabled = false;
        $("status").textContent = "Recording... Speak clearly.";
      } catch (err) {
        $("status").textContent = "Microphone error: " + err.message;
      }
    };

    $("stop").onclick = () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      if (stream) stream.getTracks().forEach(t => t.stop());
      $("start").disabled = false;
      $("stop").disabled = true;
    };

    function render() {
      $("count").textContent = samples.length;
      $("samples").innerHTML = "";
      samples.forEach((s,i) => {
        const item = document.createElement("div");
        item.className = "sample";
        const title = document.createElement("strong");
        title.textContent = s.name;
        const detail = document.createElement("p");
        detail.textContent = s.text || "(No transcript)";
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = s.url;
        const download = document.createElement("a");
        download.href = s.url;
        download.download = s.name;
        download.textContent = "Download recording";
        download.style.color = "#c7a7ff";
        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.onclick = () => {
          URL.revokeObjectURL(s.url);
          samples.splice(i,1);
          render();
        };
        item.append(title,detail,audio,document.createElement("br"),download,remove);
        $("samples").appendChild(item);
      });
    }

    $("manifest").onclick = () => {
      const manifest = {
        project:"AkTextToVoice",
        dataset_type:"personal_voice_recordings",
        created:new Date().toISOString(),
        samples:samples.map(s => ({
          file:s.name,
          transcript:s.text,
          speaker:s.speaker,
          created:s.created,
          mime:s.mime
        }))
      };
      const blob = new Blob([JSON.stringify(manifest,null,2)], {type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "voice-dataset-manifest.json";
      a.click();
      URL.revokeObjectURL(a.href);
    };
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, {once:true});
  } else {
    mount();
  }
})();
