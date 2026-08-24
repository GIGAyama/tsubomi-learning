// index.js

document.addEventListener('DOMContentLoaded', () => {
  const cardsContainer = document.getElementById('cards-container');
  const tabButtons = document.querySelectorAll('.tab-btn');

  // 1. フリップサウンドの生成 (Web Audio API)
  // AudioContext はカードをめくるたびに作らず、1つを使い回す。
  // 毎回 new すると、ブラウザが同時に持てる数の上限に当たって音が鳴らなくなる。
  let audioCtx = null;
  function getAudioContext() {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playFlipSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.18);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      console.warn("Web Audio API is blocked or not supported:", e);
    }
  }

  // 読み上げボタンの見た目を切りかえる。aria-label も一緒に変えないと、
  // 画面読み上げソフトを使っている人には「とめる」に変わったことが伝わらない。
  const SPEAKER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  const STOP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="6" y="6" rx="2"/></svg>`;

  function setAudioButtonIdle(btn) {
    btn.classList.remove('animate-pulse-ring', 'bg-orange-200', 'text-orange-700');
    btn.classList.add('bg-gray-50', 'text-gray-600');
    btn.innerHTML = `${SPEAKER_ICON}こえで きく`;
    btn.setAttribute('aria-label', btn.dataset.audioLabel || 'こえで きく');
  }

  function setAudioButtonPlaying(btn) {
    btn.classList.add('animate-pulse-ring', 'bg-orange-200', 'text-orange-700');
    btn.classList.remove('bg-gray-50', 'text-gray-600');
    btn.innerHTML = `${STOP_ICON}とめる`;
    btn.setAttribute('aria-label', 'よみあげを とめる');
  }

  // 2. カードHTMLの動的生成
  function createCardHTML(plant) {
    return `
      <article class="card-wrapper perspective-1500 w-full max-w-sm animate-card-fade-in group cursor-pointer" id="card-${plant.id}" data-category="${plant.category}">
        <div class="card-outer w-full h-[620px]">
          <div class="card-inner relative w-full h-full preserve-3d transition-transform duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 rounded-3xl">
            <!-- つぼみ（表） -->
            <div class="card-face card-front absolute w-full h-full backface-hidden rounded-3xl bg-white border border-brand-primary/10 p-6 flex flex-col justify-between overflow-hidden">
              <div class="absolute top-4 left-4 text-sm font-bold text-white bg-accent-question px-4 py-1.5 rounded-full shadow-md z-10">とい</div>
              <div class="w-full h-[260px] rounded-2xl overflow-hidden relative bg-gray-50/50 mb-4">
                <img src="${plant.budImage}" alt="${plant.name}のつぼみ"
                     width="1024" height="1024" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
              </div>
              <div class="flex-1 flex items-center justify-center p-2 text-left mb-4">
                <p class="text-xl text-gray-800 font-medium leading-relaxed ruby-rt-small js-read-target w-full">
                  ${plant.question}
                </p>
              </div>
              <div class="flex gap-3 mt-auto">
                <button class="btn-audio btn-front-audio flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200/50 rounded-xl py-3 px-4 font-bold transition-colors flex items-center justify-center gap-2" data-audio-label="${plant.questionAudioLabel}" aria-label="${plant.questionAudioLabel}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  こえで きく
                </button>
                <button class="btn-flip flex-1 bg-brand-primary hover:bg-brand-hover text-white rounded-xl py-3 px-4 font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 group/btn" aria-label="こたえを みる">
                  こたえを みる 
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover/btn:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>
            <!-- 花（裏） -->
            <div class="card-face card-back absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-white border border-accent-answer/20 p-6 flex flex-col justify-between overflow-hidden">
              <div class="absolute top-4 left-4 text-sm font-bold text-white bg-accent-answer px-4 py-1.5 rounded-full shadow-md z-10">こたえ</div>
              <div class="w-full h-[260px] rounded-2xl overflow-hidden relative bg-gray-50/50 mb-4">
                <img src="${plant.flowerImage}" alt="咲いた${plant.name}の花"
                     width="1024" height="1024" loading="lazy" decoding="async" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 flex items-center justify-center p-2 text-left mb-4">
                <p class="text-xl text-gray-800 font-medium leading-relaxed ruby-rt-small js-read-target w-full">
                  ${plant.answer}
                </p>
              </div>
              <div class="flex gap-3 mt-auto">
                <button class="btn-audio btn-back-audio flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200/50 rounded-xl py-3 px-4 font-bold transition-colors flex items-center justify-center gap-2" data-audio-label="${plant.answerAudioLabel}" aria-label="${plant.answerAudioLabel}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  こえで きく
                </button>
                <button class="btn-flip flex-1 bg-brand-secondary hover:bg-brand-secondary/80 text-brand-secondary-text rounded-xl py-3 px-4 font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 group/btn" aria-label="つぼみに もどす">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover/btn:-translate-x-1"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  つぼみを みる
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // 初期レンダリング：全植物を描画
  function renderCards(data) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = data.map(plant => createCardHTML(plant)).join('');
  }

  renderCards(window.plantsData || []);

  // 3. イベント委譲 (Event Delegation) によるイベントバインド
  let currentUtterance = null;
  let activeAudioButton = null;

  function stopAllSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (activeAudioButton) {
      setAudioButtonIdle(activeAudioButton);
      activeAudioButton = null;
    }
    currentUtterance = null;
  }

  function extractReadingText(element) {
    const clone = element.cloneNode(true);
    const rubies = clone.querySelectorAll('ruby');
    
    rubies.forEach(ruby => {
      const rt = ruby.querySelector('rt');
      if (rt) {
        const furi = rt.textContent.trim();
        ruby.replaceWith(document.createTextNode(furi));
      }
    });
    
    let text = clone.textContent;
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  function handleAudioSpeech(btn) {
    // 既に再生中のボタンを再度押した場合は停止
    if (btn === activeAudioButton) {
      stopAllSpeech();
      return;
    }
    
    // 他の音声を停止
    stopAllSpeech();
    
    const face = btn.closest('.card-face');
    const targetTextEl = face.querySelector('.js-read-target');
    if (!targetTextEl) return;
    
    const readingText = extractReadingText(targetTextEl);
    
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported.");
      return;
    }
    
    const u = new SpeechSynthesisUtterance(readingText);
    u.lang = 'ja-JP';
    u.rate = 0.75; // 小学校1年生向けのゆっくりスピード
    u.pitch = 1.15; // 明瞭で聞き取りやすい高めの声
    
    u.onstart = () => {
      setAudioButtonPlaying(btn);
      activeAudioButton = btn;
      currentUtterance = u;
    };
    
    const finish = () => {
      setAudioButtonIdle(btn);
      if (activeAudioButton === btn) {
        activeAudioButton = null;
      }
      currentUtterance = null;
    };

    u.onend = finish;
    u.onerror = finish;
    
    window.speechSynthesis.speak(u);
  }

  // コンテナへの一括クリックリスナー
  cardsContainer.addEventListener('click', (e) => {
    // A. フリップボタン（矢印ボタン）
    const flipBtn = e.target.closest('.btn-flip');
    if (flipBtn) {
      e.stopPropagation();
      const cardWrapper = flipBtn.closest('.card-wrapper');
      if (cardWrapper) {
        stopAllSpeech();
        cardWrapper.classList.toggle('is-flipped');
        playFlipSound();
      }
      return;
    }
    
    // B. 音声読み上げボタン
    const audioBtn = e.target.closest('.btn-audio');
    if (audioBtn) {
      e.stopPropagation();
      handleAudioSpeech(audioBtn);
      return;
    }
    
    // C. カード外枠全体（音声ボタン以外）
    const cardOuter = e.target.closest('.card-outer');
    if (cardOuter) {
      const cardWrapper = cardOuter.closest('.card-wrapper');
      if (cardWrapper) {
        stopAllSpeech();
        cardWrapper.classList.toggle('is-flipped');
        playFlipSound();
      }
    }
  });

  // 4. カテゴリフィルタリング (タブ切り替え)
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 全音声停止
      stopAllSpeech();
      
      // アクティブタブ切り替え
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      
      const category = button.getAttribute('data-category');
      const allCards = cardsContainer.querySelectorAll('.card-wrapper');
      
      allCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        // フィルタリング処理
        if (category === 'all' || cardCategory === category) {
          card.classList.remove('hidden');
          // アニメーションを再トリガーするためにstyleをリセット
          card.style.animation = 'none';
          card.offsetHeight; // リフローを起こす
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
          card.classList.remove('is-flipped'); // 非表示時に裏返りをリセット
        }
      });
    });
  });
});
