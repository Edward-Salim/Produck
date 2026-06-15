<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1000 1400"
  preserveAspectRatio="xMidYMax slice"
  aria-hidden="true"
  class="ink-wash-bg"
>
  <defs>
    <!-- Rice paper texture — desktop -->
    <filter id="paper" x="0" y="0" width="100%" height="100%" class="mobile-heavy-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="5" result="noise" />
      <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
      <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="textured" />
      <feComponentTransfer in="textured">
        <feFuncA type="linear" slope="0.9" />
      </feComponentTransfer>
    </filter>

    <!-- Rice paper texture — mobile (lighter) -->
    <filter id="paper-mobile" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" result="noise" />
      <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
      <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="textured" />
      <feComponentTransfer in="textured">
        <feFuncA type="linear" slope="0.85" />
      </feComponentTransfer>
    </filter>

    <!-- Ink wash blur for branches -->
    <filter id="ink-wash" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" />
    </filter>

    <!-- Light ink blur for distant elements -->
    <filter id="ink-far" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" />
    </filter>

    <!-- Petal softness -->
    <filter id="petal-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.0" />
    </filter>

    <!-- Falling petals blur — desktop -->
    <filter id="soft-blur" x="-30%" y="-30%" width="160%" height="160%" class="mobile-heavy-filter">
      <feGaussianBlur stdDeviation="3.5" />
    </filter>

    <!-- Falling petals blur — mobile (lighter) -->
    <filter id="petal-blur-mobile" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="0.6" />
    </filter>

    <!-- Mist blur — desktop -->
    <filter id="mist" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="22" />
    </filter>

    <!-- Mist blur — mobile (lighter) -->
    <filter id="mist-mobile" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" />
    </filter>

    <!-- Ink gradients -->
    <linearGradient id="ink-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3d2518" stop-opacity="0.38" />
      <stop offset="50%" stop-color="#4a3020" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#5c3a28" stop-opacity="0.1" />
    </linearGradient>

    <linearGradient id="ink-medium" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5a3824" stop-opacity="0.28" />
      <stop offset="60%" stop-color="#4a3020" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#6b4530" stop-opacity="0.06" />
    </linearGradient>

    <linearGradient id="ink-light" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#7a5540" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#6b4530" stop-opacity="0.04" />
    </linearGradient>

    <linearGradient id="ink-bamboo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5a4030" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#4a3020" stop-opacity="0.08" />
    </linearGradient>

    <!-- Blossom gradients -->
    <radialGradient id="blossom-amber">
      <stop offset="0%" stop-color="#f5b83c" stop-opacity="0.6" />
      <stop offset="30%" stop-color="#f0a830" stop-opacity="0.38" />
      <stop offset="60%" stop-color="#e89820" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#c87818" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="blossom-gold">
      <stop offset="0%" stop-color="#e8c060" stop-opacity="0.55" />
      <stop offset="30%" stop-color="#d4a840" stop-opacity="0.32" />
      <stop offset="60%" stop-color="#c89830" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#a87820" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="blossom-ochre">
      <stop offset="0%" stop-color="#d49540" stop-opacity="0.5" />
      <stop offset="30%" stop-color="#c08030" stop-opacity="0.28" />
      <stop offset="60%" stop-color="#a87028" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#8a5a20" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="blossom-pale">
      <stop offset="0%" stop-color="#f0d890" stop-opacity="0.4" />
      <stop offset="40%" stop-color="#e8cc80" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#d4b860" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="bud">
      <stop offset="0%" stop-color="#f5a830" stop-opacity="0.55" />
      <stop offset="50%" stop-color="#e89828" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#c07018" stop-opacity="0" />
    </radialGradient>

    <!-- Plum blossom center dots -->
    <radialGradient id="plum-center">
      <stop offset="0%" stop-color="#f0c050" stop-opacity="0.7" />
      <stop offset="50%" stop-color="#d49530" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#b07020" stop-opacity="0" />
    </radialGradient>

    <!-- Moon glow -->
    <radialGradient id="moon" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffdf5" stop-opacity="0.18" />
      <stop offset="40%" stop-color="#fff8e0" stop-opacity="0.1" />
      <stop offset="70%" stop-color="#faf0d0" stop-opacity="0.04" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>

    <!-- Vignette -->
    <radialGradient id="vignette" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="55%" stop-color="transparent" />
      <stop offset="82%" stop-color="#c8a878" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#a89068" stop-opacity="0.16" />
    </radialGradient>

    <!-- Center light -->
    <radialGradient id="center-glow" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="#fff8e8" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#fff4e0" stop-opacity="0.08" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>

    <!-- Reusable plum blossom petal -->
    <ellipse id="petal" cx="0" cy="-18" rx="6" ry="14" />
  </defs>

  <!-- ══════════ Rice paper ══════════ -->
  <rect width="1000" height="1400" fill="#f8f0e2" filter="url(#paper)" class="desktop-paper" />
  <rect width="1000" height="1400" fill="#f8f0e2" filter="url(#paper-mobile)" class="mobile-paper" />

  <!-- ══════════ Moon ══════════ -->
  <circle cx="720" cy="280" r="140" fill="url(#moon)" filter="url(#mist)" class="mist-filtered" />

  <!-- ══════════ Mist bands ══════════ -->
  <g filter="url(#mist)" opacity="0.35" class="mist-filtered">
    <ellipse cx="500" cy="500" rx="380" ry="18" fill="#f5edd8" />
    <ellipse cx="300" cy="620" rx="320" ry="14" fill="#f5edd8" />
    <ellipse cx="650" cy="780" rx="300" ry="16" fill="#f5edd8" />
    <ellipse cx="400" cy="950" rx="350" ry="12" fill="#f5edd8" />
  </g>

  <!-- ══════════ DISTANT MOUNTAINS ══════════ -->
  <g filter="url(#mist)" opacity="0.22" class="mist-filtered">
    <!-- Far ridge — soft rolling peaks -->
    <path d="M0,540 Q60,490 120,510 Q180,460 250,500 Q320,450 400,490 Q480,440 560,480 Q640,450 720,490 Q800,460 880,500 Q940,470 1000,490 L1000,570 L0,570 Z"
          fill="#cfc0a4" />
  </g>

  <!-- ══════════ MID MOUNTAINS ══════════ -->
  <g filter="url(#mist)" opacity="0.28" class="mist-filtered">
    <!-- Main range — gentle rounded peaks -->
    <path d="M0,600 Q70,550 130,575 Q200,510 280,555 Q360,500 440,550 Q520,490 600,540 Q680,500 760,545 Q840,510 920,550 Q960,530 1000,540 L1000,660 L0,660 Z"
          fill="#c4b290" />
  </g>

  <!-- ══════════ FOREGROUND HILLS ══════════ -->
  <g filter="url(#ink-far)" opacity="0.22" class="mobile-hide">
    <!-- Left hill — smooth dome -->
    <path d="M0,820 Q100,740 200,780 Q300,730 400,790 Q460,770 480,800 L480,880 L0,880 Z"
          fill="#b8a278" />
    <!-- Right hill — lower dome -->
    <path d="M520,840 Q640,780 740,820 Q840,770 940,820 Q980,810 1000,815 L1000,880 L520,880 Z"
          fill="#ad9870" opacity="0.7" />
  </g>

  <!-- ══════════ BASE GROUND ══════════ -->
  <g filter="url(#ink-far)" opacity="0.18" class="mobile-hide">
    <path d="M0,980 Q120,950 250,970 Q380,940 500,965 Q620,945 750,970 Q880,950 1000,960 L1000,1020 L0,1020 Z"
          fill="#a08860" />
  </g>

  <!-- ══════════ WATER / MIST AT BASE ══════════ -->
  <g filter="url(#mist)" opacity="0.18" class="mist-filtered mobile-hide">
    <ellipse cx="250" cy="980" rx="320" ry="14" fill="#e8dcc8" />
    <ellipse cx="700" cy="985" rx="280" ry="12" fill="#e8dcc8" />
  </g>

  <!-- Center glow -->
  <rect width="1000" height="1400" fill="url(#center-glow)" />
  <!-- Vignette -->
  <rect width="1000" height="1400" fill="url(#vignette)" />

  <!-- ═══════════════ TOP-RIGHT BRANCH ═══════════════ -->
  <g filter="url(#ink-wash)">
    <!-- Main branch -->
    <path d="M1000,0 Q920,80 850,160 Q780,240 740,200 Q700,160 680,220 Q660,280 620,330"
          stroke="url(#ink-dark)" stroke-width="9" fill="none" stroke-linecap="round" />
    <path d="M1000,0 Q920,80 850,160 Q780,240 740,200 Q700,160 680,220 Q660,280 620,330"
          stroke="url(#ink-medium)" stroke-width="4.5" fill="none" stroke-linecap="round" />

    <!-- Drooping branch -->
    <path d="M820,180 Q800,260 790,340 Q785,380 800,420"
          stroke="url(#ink-dark)" stroke-width="5.5" fill="none" stroke-linecap="round" />
    <path d="M820,180 Q800,260 790,340 Q785,380 800,420"
          stroke="url(#ink-medium)" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <!-- Upward twig -->
    <path d="M760,190 Q740,150 720,120 Q710,105 700,95"
          stroke="url(#ink-light)" stroke-width="3" fill="none" stroke-linecap="round" />

    <!-- Crossing twig -->
    <path d="M880,100 Q840,110 800,140 Q770,160 750,190"
          stroke="url(#ink-medium)" stroke-width="2" fill="none" stroke-linecap="round" />

    <!-- Fine twigs -->
    <path d="M740,200 Q710,210 680,230" stroke="url(#ink-light)" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <path d="M620,330 Q600,350 590,370" stroke="url(#ink-light)" stroke-width="1" fill="none" stroke-linecap="round" />
    <path d="M800,420 Q810,440 815,460" stroke="url(#ink-light)" stroke-width="1" fill="none" stroke-linecap="round" />
  </g>

  <!-- Top-right plum blossoms + round blossoms -->
  <g filter="url(#petal-blur)">
    <!-- Round blossom cluster on main branch -->
    <circle cx="730" cy="195" r="26" fill="url(#blossom-amber)" />
    <circle cx="725" cy="190" r="16" fill="url(#blossom-gold)" />
    <circle cx="738" cy="200" r="11" fill="url(#blossom-pale)" />

    <!-- Round blossom on drooping branch -->
    <circle cx="798" cy="350" r="22" fill="url(#blossom-gold)" />
    <circle cx="793" cy="345" r="13" fill="url(#blossom-amber)" />

    <!-- Round blossom near corner -->
    <circle cx="900" cy="70" r="28" fill="url(#blossom-ochre)" />
    <circle cx="895" cy="65" r="18" fill="url(#blossom-amber)" />
    <circle cx="908" cy="75" r="12" fill="url(#blossom-gold)" />

    <!-- Plum blossom at twig end -->
    <g transform="translate(698,98) scale(0.9)">
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(0)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(72)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(144)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(216)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(288)" />
      <circle cx="0" cy="0" r="3" fill="url(#plum-center)" />
    </g>

    <!-- Plum blossom on droop end -->
    <g transform="translate(808,355) scale(0.75)">
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(30)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(102)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(174)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(246)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(318)" />
      <circle cx="0" cy="0" r="2.5" fill="url(#plum-center)" />
    </g>

    <!-- Buds -->
    <circle cx="780" cy="250" r="7" fill="url(#bud)" />
    <circle cx="760" cy="185" r="5" fill="url(#bud)" />
    <circle cx="650" cy="280" r="6" fill="url(#bud)" />
    <circle cx="810" cy="400" r="4.5" fill="url(#bud)" />
    <circle cx="880" cy="115" r="8" fill="url(#bud)" />
  </g>

  <!-- ═══════════════ BOTTOM-LEFT BRANCH ═══════════════ -->
  <g filter="url(#ink-wash)">
    <!-- Main branch -->
    <path d="M0,1400 Q80,1320 150,1240 Q220,1160 280,1120 Q340,1080 360,1020"
          stroke="url(#ink-dark)" stroke-width="11" fill="none" stroke-linecap="round" />
    <path d="M0,1400 Q80,1320 150,1240 Q220,1160 280,1120 Q340,1080 360,1020"
          stroke="url(#ink-medium)" stroke-width="5.5" fill="none" stroke-linecap="round" />

    <!-- Branch reaching up -->
    <path d="M360,1020 Q400,940 420,880 Q435,830 430,780"
          stroke="url(#ink-medium)" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <path d="M360,1020 Q400,940 420,880 Q435,830 430,780"
          stroke="url(#ink-light)" stroke-width="2" fill="none" stroke-linecap="round" />

    <!-- Secondary branch -->
    <path d="M200,1220 Q240,1160 300,1120 Q340,1090 370,1080"
          stroke="url(#ink-medium)" stroke-width="3.5" fill="none" stroke-linecap="round" />

    <!-- Crossing twig -->
    <path d="M280,1120 Q300,1060 320,1000 Q335,960 340,920"
          stroke="url(#ink-light)" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <!-- Tendrils -->
    <path d="M430,780 Q440,740 445,700" stroke="url(#ink-light)" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <path d="M340,920 Q350,890 360,860" stroke="url(#ink-light)" stroke-width="1" fill="none" stroke-linecap="round" />
    <path d="M150,1240 Q120,1190 100,1150" stroke="url(#ink-light)" stroke-width="2" fill="none" stroke-linecap="round" />
  </g>

  <!-- Bottom-left blossoms -->
  <g filter="url(#petal-blur)">
    <!-- Round blossom cluster -->
    <circle cx="355" cy="1025" r="30" fill="url(#blossom-amber)" />
    <circle cx="348" cy="1018" r="20" fill="url(#blossom-gold)" />
    <circle cx="362" cy="1030" r="12" fill="url(#blossom-pale)" />

    <!-- Round blossom -->
    <circle cx="428" cy="830" r="24" fill="url(#blossom-gold)" />
    <circle cx="423" cy="825" r="14" fill="url(#blossom-amber)" />

    <!-- Round blossom near corner -->
    <circle cx="80" cy="1330" r="26" fill="url(#blossom-amber)" />
    <circle cx="75" cy="1325" r="16" fill="url(#blossom-pale)" />

    <!-- Plum blossom on upward branch -->
    <g transform="translate(440,715) scale(0.85)">
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(15)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(87)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(159)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(231)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-amber)" transform="rotate(303)" />
      <circle cx="0" cy="0" r="2.8" fill="url(#plum-center)" />
    </g>

    <!-- Plum blossom on crossing twig -->
    <g transform="translate(338,935) scale(0.7)">
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(45)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(117)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(189)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(261)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-gold)" transform="rotate(333)" />
      <circle cx="0" cy="0" r="2.3" fill="url(#plum-center)" />
    </g>

    <!-- Round on secondary -->
    <circle cx="295" cy="1125" r="18" fill="url(#blossom-ochre)" />
    <circle cx="290" cy="1120" r="10" fill="url(#blossom-gold)" />

    <!-- Buds -->
    <circle cx="400" cy="950" r="7" fill="url(#bud)" />
    <circle cx="240" cy="1170" r="5.5" fill="url(#bud)" />
    <circle cx="320" cy="1010" r="6" fill="url(#bud)" />
    <circle cx="100" cy="1160" r="4.5" fill="url(#bud)" />
    <circle cx="445" cy="760" r="5" fill="url(#bud)" />
    <circle cx="370" cy="1070" r="4" fill="url(#bud)" />
  </g>

  <!-- ═══════════════ BAMBOO — bottom-left cluster ═══════════════ -->
  <g filter="url(#ink-wash)" opacity="0.55" class="mobile-hide">
    <!-- Bamboo stalk -->
    <path d="M0,1250 Q15,1200 12,1140 Q10,1090 18,1040"
          stroke="url(#ink-bamboo)" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M0,1250 Q15,1200 12,1140 Q10,1090 18,1040"
          stroke="url(#ink-light)" stroke-width="1.2" fill="none" stroke-linecap="round" />
    <!-- Node lines -->
    <path d="M8,1200 Q18,1197 22,1203" stroke="url(#ink-bamboo)" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <path d="M7,1140 Q17,1137 21,1143" stroke="url(#ink-bamboo)" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <path d="M10,1085 Q20,1082 24,1088" stroke="url(#ink-bamboo)" stroke-width="1.5" fill="none" stroke-linecap="round" />
  </g>

  <!-- Bamboo leaves -->
  <g filter="url(#petal-blur)" opacity="0.4" class="mobile-hide">
    <!-- Leaf cluster 1 -->
    <ellipse cx="40" cy="1195" rx="3" ry="22" fill="#6b5530" transform="rotate(-30,40,1195)" />
    <ellipse cx="45" cy="1190" rx="2.5" ry="18" fill="#5a4530" transform="rotate(15,45,1190)" />
    <ellipse cx="32" cy="1185" rx="2.5" ry="20" fill="#6b5530" transform="rotate(-50,32,1185)" />
    <!-- Leaf cluster 2 -->
    <ellipse cx="30" cy="1135" rx="2.5" ry="16" fill="#5a4530" transform="rotate(-20,30,1135)" />
    <ellipse cx="35" cy="1130" rx="2" ry="14" fill="#6b5530" transform="rotate(25,35,1130)" />
    <!-- Leaf cluster 3 -->
    <ellipse cx="55" cy="1080" rx="2.5" ry="18" fill="#5a4530" transform="rotate(-35,55,1080)" />
    <ellipse cx="60" cy="1075" rx="2" ry="15" fill="#6b5530" transform="rotate(20,60,1075)" />
    <ellipse cx="48" cy="1070" rx="2" ry="14" fill="#5a4530" transform="rotate(-55,48,1070)" />
  </g>

  <!-- ═══════════════ BAMBOO — top-right sprig ═══════════════ -->
  <g filter="url(#ink-wash)" opacity="0.4" class="mobile-hide">
    <path d="M900,0 Q910,40 905,80 Q900,110 908,140"
          stroke="url(#ink-bamboo)" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M905,40 Q915,38 920,42" stroke="url(#ink-bamboo)" stroke-width="1.2" fill="none" stroke-linecap="round" />
    <path d="M904,90 Q914,88 919,92" stroke="url(#ink-bamboo)" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>

  <g filter="url(#petal-blur)" opacity="0.35" class="mobile-hide">
    <ellipse cx="930" cy="35" rx="2" ry="16" fill="#6b5530" transform="rotate(30,930,35)" />
    <ellipse cx="935" cy="30" rx="1.8" ry="14" fill="#5a4530" transform="rotate(-20,935,30)" />
    <ellipse cx="928" cy="85" rx="2" ry="14" fill="#5a4530" transform="rotate(25,928,85)" />
    <ellipse cx="920" cy="135" rx="2.2" ry="18" fill="#6b5530" transform="rotate(-30,920,135)" />
    <ellipse cx="925" cy="130" rx="1.8" ry="13" fill="#5a4530" transform="rotate(35,925,130)" />
  </g>

  <!-- ═══════════════ BOTTOM-RIGHT — branch tip ═══════════════ -->
  <g filter="url(#ink-wash)">
    <path d="M1000,1400 Q920,1350 880,1290 Q850,1240 830,1200"
          stroke="url(#ink-medium)" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M1000,1400 Q920,1350 880,1290 Q850,1240 830,1200"
          stroke="url(#ink-light)" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M880,1290 Q900,1250 910,1210"
          stroke="url(#ink-light)" stroke-width="2" fill="none" stroke-linecap="round" />
  </g>

  <g filter="url(#petal-blur)">
    <circle cx="835" cy="1205" r="18" fill="url(#blossom-gold)" />
    <circle cx="830" cy="1200" r="11" fill="url(#blossom-amber)" />
    <circle cx="910" cy="1215" r="13" fill="url(#blossom-ochre)" />
    <circle cx="908" cy="1212" r="7" fill="url(#blossom-pale)" />
    <circle cx="860" cy="1260" r="5.5" fill="url(#bud)" />
    <circle cx="900" cy="1230" r="4.5" fill="url(#bud)" />
  </g>

  <!-- ═══════════════ TOP-LEFT — light tendril ═══════════════ -->
  <g filter="url(#ink-wash)">
    <path d="M0,0 Q60,40 100,100 Q130,150 140,200"
          stroke="url(#ink-light)" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M0,0 Q60,40 100,100 Q130,150 140,200"
          stroke="url(#ink-light)" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5" />
    <path d="M100,100 Q140,90 170,80"
          stroke="url(#ink-light)" stroke-width="1.5" fill="none" stroke-linecap="round" />
  </g>

  <g filter="url(#petal-blur)">
    <!-- Plum blossom -->
    <g transform="translate(138,198) scale(0.65)">
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-pale)" transform="rotate(10)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-pale)" transform="rotate(82)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-pale)" transform="rotate(154)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-pale)" transform="rotate(226)" />
      <ellipse cx="0" cy="-16" rx="5" ry="12" fill="url(#blossom-pale)" transform="rotate(298)" />
      <circle cx="0" cy="0" r="2.2" fill="url(#plum-center)" />
    </g>
    <circle cx="165" cy="82" r="9" fill="url(#blossom-ochre)" />
    <circle cx="163" cy="80" r="4.5" fill="url(#blossom-pale)" />
    <circle cx="120" cy="145" r="4.5" fill="url(#bud)" />
  </g>

  <!-- ═══════════════ FALLING PETALS ═══════════════ -->
  <g filter="url(#soft-blur)" opacity="0.35" class="mobile-hide">
    <!-- Larger scattered petals -->
    <ellipse cx="480" cy="380" rx="4" ry="8" fill="#e8c060" transform="rotate(30,480,380)" />
    <ellipse cx="350" cy="520" rx="3" ry="7" fill="#f0a830" transform="rotate(-20,350,520)" />
    <ellipse cx="580" cy="450" rx="3.5" ry="7.5" fill="#d4a840" transform="rotate(45,580,450)" />
    <ellipse cx="420" cy="680" rx="3" ry="6.5" fill="#e89820" transform="rotate(-35,420,680)" />
    <ellipse cx="550" cy="580" rx="4" ry="8" fill="#c89830" transform="rotate(15,550,580)" />
    <ellipse cx="320" cy="420" rx="3" ry="6" fill="#f5b83c" transform="rotate(-55,320,420)" />
    <ellipse cx="620" cy="550" rx="3.5" ry="7" fill="#e8cc80" transform="rotate(60,620,550)" />
    <ellipse cx="460" cy="720" rx="3" ry="6.5" fill="#d4a840" transform="rotate(-15,460,720)" />
    <ellipse cx="380" cy="600" rx="2.5" ry="5.5" fill="#f0a830" transform="rotate(40,380,600)" />
    <ellipse cx="520" cy="340" rx="3" ry="6" fill="#e8c060" transform="rotate(-40,520,340)" />
    <ellipse cx="280" cy="560" rx="2.5" ry="5" fill="#d49540" transform="rotate(25,280,560)" />
    <ellipse cx="650" cy="380" rx="3" ry="6" fill="#f5b83c" transform="rotate(-10,650,380)" />
    <ellipse cx="500" cy="850" rx="3" ry="6.5" fill="#e8c060" transform="rotate(50,500,850)" />
    <ellipse cx="340" cy="780" rx="2.5" ry="5.5" fill="#d4a840" transform="rotate(-30,340,780)" />
    <ellipse cx="600" cy="700" rx="3" ry="6" fill="#f0a830" transform="rotate(20,600,700)" />

    <!-- Distant tiny petals -->
    <ellipse cx="700" cy="500" rx="2" ry="4" fill="#e8cc80" transform="rotate(35,700,500)" />
    <ellipse cx="250" cy="350" rx="2" ry="4.5" fill="#f0a830" transform="rotate(-25,250,350)" />
    <ellipse cx="680" cy="650" rx="1.8" ry="4" fill="#d4a840" transform="rotate(55,680,650)" />
    <ellipse cx="400" cy="250" rx="2" ry="4" fill="#f5b83c" transform="rotate(-45,400,250)" />
    <ellipse cx="560" cy="900" rx="2" ry="4.5" fill="#e8c060" transform="rotate(15,560,900)" />
  </g>

  <!-- ═══════════════ SEAL STAMP (印章) ═══════════════ -->
  <g transform="translate(915, 1310)" opacity="0.48" filter="url(#petal-blur)">
    <rect x="0" y="0" width="32" height="32" rx="1" fill="#c04030" />
    <!-- Stylized character hint inside seal -->
    <path d="M8,8 L24,8 M8,12 L24,12 M16,8 L16,24 M8,16 L24,16 M8,20 L24,20"
          stroke="#f8e8d0" stroke-width="1.2" fill="none" opacity="0.5" />
  </g>
</svg>

<style>
  .ink-wash-bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    z-index: -1;
    pointer-events: none;
    background: #f8f0e2;
  }

  /* Mobile performance: hide heavy elements */
  @media (max-width: 768px) {
    .mobile-hide {
      opacity: 0;
      transition: opacity 0.3s;
    }
    .mobile-paper {
      display: block;
    }
    .desktop-paper {
      display: none;
    }
    .mist-filtered {
      filter: url(#mist-mobile);
    }
  }

  @media (min-width: 769px) {
    .mobile-paper {
      display: none;
    }
    .desktop-paper {
      display: block;
    }
  }
</style>
