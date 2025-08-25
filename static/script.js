// static/script.js
(() => {
  // ---------- DOM ----------
  const root = document.documentElement;
  const form = document.getElementById('cpe-form');
  const layout = document.querySelector('.layout');
  const leftCol = document.querySelector('.left');
  const rightPanel = document.querySelector('.right-panel');
  const calcBtn = document.getElementById('btn-calc');
  const resultWrap = document.getElementById('result'); // aside
  const resultPanel = document.getElementById('result-panel'); // box
  const statusEl = document.getElementById('status');
  const probEl = document.getElementById('prob');
  const aboutWrap = document.getElementById('about');

  if (!form || !layout || !leftCol || !rightPanel || !calcBtn || !resultPanel) {
    console.warn('[init] required elements missing');
    return;
  } // ---------- Helpers ----------

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches; // "Part X" 섹션의 카드 컨테이너(.card-container) 찾기

  const getPartContainer = (letter) => {
    const titles = Array.from(leftCol.querySelectorAll('h2.part-title'));
    const title = titles.find((h) => (h.textContent || '').trim().startsWith(`Part ${letter}`));
    return title?.nextElementSibling?.closest('.card-container') || null;
  }; // ---------- Auto align (줌/리사이즈/DOM변화 모두 대응) ----------

  const align = (() => {
    let scheduled = false;

    function updateNow() {
      scheduled = false;

      if (isMobile()) {
        root.style.setProperty('--right-offset', '12px');
        root.style.setProperty('--result-offset', '0px');
        root.style.setProperty('--result-height', 'auto');
        root.style.setProperty('--about-offset', '0px');
        root.style.setProperty('--about-width', 'auto'); // 모바일에서는 width를 'auto'로 설정
        return;
      }

      const partA = getPartContainer('A');
      const partB = getPartContainer('B');
      const partC = getPartContainer('C');

      if (!partA || !partB) return; // 1) 오른쪽 컬럼 Y를 Part A 첫 카드 상단과 정렬

      const layoutTop = layout.getBoundingClientRect().top;
      const partATop = partA.getBoundingClientRect().top;
      const rightOff = Math.max(0, Math.round(partATop - layoutTop));
      root.style.setProperty('--right-offset', rightOff + 'px'); // 2) 결과 패널 상단/높이를 Part B 카드 컨테이너와 동일하게

      const bRect = partB.getBoundingClientRect();
      const btnBottom = calcBtn.getBoundingClientRect().bottom;
      const gapStr = getComputedStyle(rightPanel).rowGap || getComputedStyle(rightPanel).gap || '0';
      const colGap = parseFloat(gapStr) || 0;

      const resultTopIfZero = btnBottom + colGap;
      const resMarginTop = Math.max(0, Math.floor(bRect.top - resultTopIfZero));
      const resHeight = Math.max(0, Math.floor(bRect.height));
      root.style.setProperty('--result-offset', resMarginTop + 'px');
      root.style.setProperty('--result-height', resHeight + 'px'); // 3) About 상단을 Part C 첫 카드 컨테이너 상단에 맞춤

      if (partC && aboutWrap) {
        const bBottom = Math.round(bRect.top + bRect.height);
        const aboutTopIfZero = bBottom + colGap;

        const firstCardC = partC.querySelector('.card');
        const cCardTop = Math.round((firstCardC || partC).getBoundingClientRect().top);
        const aboutOffset = Math.max(0, Math.round(cCardTop - aboutTopIfZero));
        root.style.setProperty('--about-offset', aboutOffset + 'px'); // ★ 추가: Part C 전체 높이를 CSS 변수로 전달

        const cRect = partC.getBoundingClientRect();
        root.style.setProperty('--about-height', Math.max(0, Math.floor(cRect.height)) + 'px');
      }

      // 4) About의 너비를 right-panel과 동일하게 설정
      const rightWidth = rightPanel.getBoundingClientRect().width;
      root.style.setProperty('--about-width', rightWidth + 'px');
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateNow);
    } // 이벤트 바인딩

    window.addEventListener('load', schedule);
    window.addEventListener('resize', schedule); // 줌 포함
    document.fonts?.ready?.then(schedule);
    setTimeout(schedule, 0);

    const ro = new ResizeObserver(schedule);
    ro.observe(leftCol);
    ro.observe(document.body);
    if (rightPanel) ro.observe(rightPanel); // rightPanel의 크기 변화도 감지
    if (aboutWrap) ro.observe(aboutWrap); // aboutWrap의 크기 변화도 감지

    const mo = new MutationObserver(schedule);
    mo.observe(leftCol, { childList: true, subtree: true, attributes: true });

    return { schedule };
  })(); // ---------- Predict ----------

  async function submitPredict(ev) {
    if (ev) ev.preventDefault(); // 폼 데이터 수집

    const fd = new FormData(form);
    const payload = {};
    for (const [k, v] of fd.entries()) payload[k] = v; // 숫자 보정

    if (payload['hospital-days'] !== undefined) {
      let hd = Number(payload['hospital-days']);
      if (!Number.isFinite(hd) || hd < 0) hd = 0;
      payload['hospital-days'] = String(hd);
    } // 버튼 상태

    const prevLabel = calcBtn.textContent;
    calcBtn.disabled = true;
    calcBtn.textContent = 'Calculating...';

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = await res.json(); // 텍스트/값 표시

      statusEl.textContent = data.status || '—';
      probEl.textContent = data.probability ?? '—'; // 패널 상태 토글

      const isPositive = data?.icon === 'positive';
      resultPanel.classList.remove('hidden', 'is-ok', 'is-warn');
      resultPanel.classList.add(isPositive ? 'is-warn' : 'is-ok'); // 모바일은 결과 위치로 스크롤

      if (isMobile()) {
        resultWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } // 레이아웃 재정렬

      align.schedule();
    } catch (err) {
      console.error('[predict error]', err);
      statusEl.textContent = 'Error';
      probEl.textContent = '—';
      resultPanel.classList.remove('hidden', 'is-ok', 'is-warn');
      resultPanel.classList.add('is-warn');
      alert('예측 중 오류가 발생했습니다. (자세한 내용은 콘솔 확인)');
    } finally {
      calcBtn.disabled = false;
      calcBtn.textContent = prevLabel || 'CALCULATE CPE RISK';
    }
  } // 폼 제출 & 버튼 클릭

  form.addEventListener('submit', submitPredict);
  calcBtn.addEventListener('click', submitPredict);
})();
