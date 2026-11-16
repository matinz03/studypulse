export interface PipTimerState {
  clockText: string;
  subjectName: string;
  subjectColor: string;
  taskTitle: string;
  modeLabel: string;
  isRunning: boolean;
  progress: number;
  purityPct: number;
}

export interface PipActions {
  onToggleRun: () => void;
  onBoost5m: () => void;
  onFinish: () => void;
}

interface DocumentPictureInPictureApi {
  requestWindow: (opts?: { width?: number; height?: number }) => Promise<Window>;
}

class FloatingPipEngine {
  private docPipWin: Window | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private activeKind: 'none' | 'doc' | 'video' = 'none';
  private latestState: PipTimerState = {
    clockText: '25:00',
    subjectName: 'Deep Focus',
    subjectColor: '#10B981',
    taskTitle: '',
    modeLabel: 'Pomodoro',
    isRunning: false,
    progress: 0,
    purityPct: 100,
  };
  private actions: PipActions = {
    onToggleRun: () => {},
    onBoost5m: () => {},
    onFinish: () => {},
  };
  private listeners = new Set<(active: boolean) => void>();

  isSupported() {
    if (typeof window === 'undefined') return false;
    const hasDocPip = 'documentPictureInPicture' in window;
    const hasVideoPip =
      typeof document !== 'undefined' &&
      'pictureInPictureEnabled' in document &&
      Boolean((document as Document).pictureInPictureEnabled);
    return hasDocPip || hasVideoPip;
  }

  isActive() {
    return this.activeKind !== 'none';
  }

  onChange(cb: (active: boolean) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit() {
    const active = this.isActive();
    for (const cb of this.listeners) cb(active);
  }

  setActions(actions: PipActions) {
    this.actions = actions;
    this.bindMediaSessionHandlers();
  }

  updateState(next: PipTimerState) {
    this.latestState = next;
    if (this.activeKind === 'doc') {
      this.renderDocPip();
    } else if (this.activeKind === 'video') {
      this.renderCanvasHud();
    }
    this.updateMediaSessionMetadata();
  }

  async toggle(actions: PipActions): Promise<boolean> {
    this.setActions(actions);
    if (this.isActive()) {
      await this.close();
      return false;
    }
    return this.open();
  }

  async open(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const docPip = (window as unknown as { documentPictureInPicture?: DocumentPictureInPictureApi })
      .documentPictureInPicture;

    if (docPip?.requestWindow) {
      try {
        const win = await docPip.requestWindow({ width: 372, height: 152 });
        this.docPipWin = win;
        this.activeKind = 'doc';
        this.setupDocPipDom(win);
        this.renderDocPip();
        win.addEventListener('pagehide', () => {
          this.docPipWin = null;
          this.activeKind = 'none';
          this.emit();
        });
        this.emit();
        return true;
      } catch {
        // Fallback to Canvas -> Video PiP below
      }
    }

    try {
      if (!this.canvasEl) {
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.width = 480;
        this.canvasEl.height = 240;
      }
      this.renderCanvasHud();
      if (!this.videoEl) {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.style.position = 'fixed';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.001';
        video.style.pointerEvents = 'none';
        video.addEventListener('leavepictureinpicture', () => {
          this.activeKind = 'none';
          this.emit();
        });
        document.body.appendChild(video);
        this.videoEl = video;
      }
      if (!this.stream && 'captureStream' in this.canvasEl) {
        this.stream = this.canvasEl.captureStream(2);
        this.videoEl.srcObject = this.stream;
      }
      await this.videoEl.play();
      if ('requestPictureInPicture' in this.videoEl) {
        await this.videoEl.requestPictureInPicture();
        this.activeKind = 'video';
        this.emit();
        return true;
      }
    } catch {
      this.activeKind = 'none';
      this.emit();
    }
    return false;
  }

  async close() {
    if (this.docPipWin) {
      try {
        this.docPipWin.close();
      } catch {
        // ignore
      }
      this.docPipWin = null;
    }
    if (typeof document !== 'undefined' && document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch {
        // ignore
      }
    }
    this.activeKind = 'none';
    this.emit();
  }

  private setupDocPipDom(win: Window) {
    const doc = win.document;
    doc.title = 'StudyPulse — Mini Focus HUD';
    doc.body.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", sans-serif; }
        body {
          background: radial-gradient(circle at 12% 15%, rgba(255,255,255,0.08), transparent 55%),
                      #09090b;
          color: #fafafa;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px 14px;
          border: 1px solid rgba(255,255,255,0.14);
          overflow: hidden;
        }
        .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .badge {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
          max-width: 230px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
        .purity { font-size: 11px; font-weight: 700; color: #e4e4e7; }
        .mid { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin: 6px 0; }
        .clock { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; }
        .task { font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 175px; text-align: right; }
        .track { width: 100%; height: 5px; border-radius: 999px; background: rgba(255,255,255,0.1); overflow: hidden; margin-bottom: 8px; }
        .bar { height: 100%; border-radius: 999px; background: #fafafa; transition: width 0.3s linear; }
        .actions { display: flex; gap: 7px; }
        button {
          border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px 10px;
          font-size: 11px; font-weight: 800; cursor: pointer; background: rgba(255,255,255,0.07); color: #fafafa;
        }
        button.primary { flex: 1; background: #fafafa; color: #09090b; border: none; }
        button.paused { flex: 1; background: rgba(255,255,255,0.18); color: #fafafa; border: 1px solid rgba(255,255,255,0.3); }
      </style>
      <div class="top">
        <span class="badge"><span id="sp-dot" class="dot"></span><span id="sp-sub"></span></span>
        <span id="sp-purity" class="purity"></span>
      </div>
      <div class="mid">
        <div id="sp-clock" class="clock">25:00</div>
        <div id="sp-task" class="task"></div>
      </div>
      <div class="track"><div id="sp-bar" class="bar"></div></div>
      <div class="actions">
        <button id="sp-boost">+5m</button>
        <button id="sp-toggle" class="primary">Pause</button>
        <button id="sp-finish">Finish</button>
      </div>
    `;
    doc.getElementById('sp-toggle')?.addEventListener('click', () => this.actions.onToggleRun());
    doc.getElementById('sp-boost')?.addEventListener('click', () => this.actions.onBoost5m());
    doc.getElementById('sp-finish')?.addEventListener('click', () => this.actions.onFinish());
  }

  private renderDocPip() {
    const doc = this.docPipWin?.document;
    if (!doc) return;
    const s = this.latestState;
    const dot = doc.getElementById('sp-dot');
    const sub = doc.getElementById('sp-sub');
    const purity = doc.getElementById('sp-purity');
    const clock = doc.getElementById('sp-clock');
    const task = doc.getElementById('sp-task');
    const bar = doc.getElementById('sp-bar');
    const toggleBtn = doc.getElementById('sp-toggle');

    if (dot) dot.style.backgroundColor = s.subjectColor;
    if (sub) sub.textContent = `${s.modeLabel} • ${s.subjectName}`;
    if (purity) purity.textContent = `🛡 ${s.purityPct}%`;
    if (clock) clock.textContent = s.clockText;
    if (task) task.textContent = s.taskTitle || 'Stay locked in';
    if (bar) bar.style.width = `${Math.round(Math.min(1, Math.max(0, s.progress)) * 100)}%`;
    if (toggleBtn) {
      toggleBtn.textContent = s.isRunning ? 'Pause' : 'Resume';
      toggleBtn.className = s.isRunning ? 'paused' : 'primary';
    }
  }

  private renderCanvasHud() {
    const canvas = this.canvasEl;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = this.latestState;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    const g1 = ctx.createRadialGradient(80, 40, 10, 80, 40, 220);
    g1.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    // Liquid glass frame
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(14, 14, w - 28, h - 28, 22);
    ctx.fillStyle = 'rgba(24, 24, 27, 0.84)';
    ctx.fill();
    ctx.stroke();

    // Header pill
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.arc(42, 48, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FAFAFA';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`${s.modeLabel} • ${s.subjectName}`.slice(0, 28), 58, 54);

    ctx.fillStyle = '#D4D4D8';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`🛡 ${s.purityPct}%`, w - 34, 54);

    // Large monospace clock
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 72px monospace';
    ctx.fillText(s.clockText, w / 2, 140);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 16px sans-serif';
    ctx.fillText((s.taskTitle || (s.isRunning ? 'StudyPulse Live Session' : 'Paused')).slice(0, 42), w / 2, 174);

    // Bottom progress bar
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.roundRect(34, 198, w - 68, 10, 5);
    ctx.fill();

    const pct = Math.min(1, Math.max(0.03, s.progress));
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.roundRect(34, 198, Math.max(12, (w - 68) * pct), 10, 5);
    ctx.fill();
    ctx.textAlign = 'left';
  }

  private updateMediaSessionMetadata() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const s = this.latestState;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${s.clockText} • ${s.subjectName}`,
        artist: s.taskTitle || `StudyPulse (${s.modeLabel})`,
        album: `Purity ${s.purityPct}%`,
      });
      navigator.mediaSession.playbackState = s.isRunning ? 'playing' : 'paused';
    } catch {
      // ignore unsupported MediaMetadata environments
    }
  }

  private bindMediaSessionHandlers() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (!this.latestState.isRunning) this.actions.onToggleRun();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (this.latestState.isRunning) this.actions.onToggleRun();
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        this.actions.onBoost5m();
      });
    } catch {
      // ignore unsupported actions
    }
  }
}

export const pipEngine = new FloatingPipEngine();
