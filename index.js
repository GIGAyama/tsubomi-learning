// index.js

document.addEventListener('DOMContentLoaded', () => {
  const cardsContainer = document.getElementById('cards-container');
  const tabButtons = document.querySelectorAll('.tab-btn');

  // 1. フリップサウンドの生成 (Web Audio API)
  function playFlipSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
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

  // 2. カードHTMLの動的生成
  function createCardHTML(plant) {
    return `
      <article class="card-wrapper" id="card-${plant.id}" data-category="${plant.category}">
        <div class="card-outer">
          <div class="card-inner">
            <!-- つぼみ（表） -->
            <div class="card-face card-front">
              <div class="card-badge badge-question">とい</div>
              <div class="image-box">
                <img src="${plant.budImage}" alt="${plant.name}のつぼみ" loading="lazy">
              </div>
              <div class="text-box">
                <p class="question-text js-read-target">
                  ${plant.question}
                </p>
              </div>
              <div class="btn-group">
                <button class="btn btn-audio btn-front-audio" aria-label="こえで きく">
                  <span class="btn-icon">🔊</span>こえで きく
                </button>
                <button class="btn btn-action btn-flip" aria-label="こたえを みる">
                  こたえを みる <span class="btn-arrow">→</span>
                </button>
              </div>
            </div>
            <!-- 花（裏） -->
            <div class="card-face card-back">
              <div class="card-badge badge-answer">こたえ</div>
              <div class="image-box">
                <img src="${plant.flowerImage}" alt="咲いた${plant.name}の花" loading="lazy">
              </div>
              <div class="text-box">
                <p class="answer-text js-read-target">
                  ${plant.answer}
                </p>
              </div>
              <div class="btn-group">
                <button class="btn btn-audio btn-back-audio" aria-label="こえで きく">
                  <span class="btn-icon">🔊</span>こえで きく
                </button>
                <button class="btn btn-action btn-secondary btn-flip" aria-label="つぼみに もどす">
                  <span class="btn-arrow">←</span> つぼみを みる
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
      activeAudioButton.classList.remove('is-playing');
      activeAudioButton.innerHTML = `<span class="btn-icon">🔊</span>こえで きく`;
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
      btn.classList.add('is-playing');
      btn.innerHTML = `<span class="btn-icon">⏹️</span>とめる`;
      activeAudioButton = btn;
      currentUtterance = u;
    };
    
    u.onend = () => {
      btn.classList.remove('is-playing');
      btn.innerHTML = `<span class="btn-icon">🔊</span>こえで きく`;
      if (activeAudioButton === btn) {
        activeAudioButton = null;
      }
      currentUtterance = null;
    };
    
    u.onerror = () => {
      btn.classList.remove('is-playing');
      btn.innerHTML = `<span class="btn-icon">🔊</span>こえで きく`;
      if (activeAudioButton === btn) {
        activeAudioButton = null;
      }
      currentUtterance = null;
    };
    
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
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      
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
