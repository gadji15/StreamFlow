// Somewhere in your Header component, replace the text logo with the SVG logo

// Before (text logo example):
/*
<Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
  StreamFlow
</Link>
*/

// After (with SVG logo):
<Link href="/" className="flex items-center">
  <div className="w-10 h-10 mr-2">
    {/* Utilise l'image SVG directement dans le code pour les animations */}
    <svg width="40" height="40" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      
      {/* S stylisé simplifié */}
      <path d="
        M 165 80
        C 145 80, 105 80, 95 100
        C 85 120, 95 135, 115 140
        L 145 150
        C 165 155, 175 170, 165 190
        C 155 210, 115 210, 95 210
        M 95 210
        C 115 210, 155 210, 165 190
        C 175 170, 165 155, 145 150
        L 115 140
        C 95 135, 85 120, 95 100
        C 105 80, 145 80, 165 80
        " 
        stroke="url(#headerGradient)" strokeWidth="16" strokeLinecap="round" fill="none">
      </path>
      
      {/* Vague avec animation */}
      <path d="
        M 65 170
        Q 90 155, 115 170
        Q 140 185, 165 170
        Q 190 155, 215 170
        " 
        stroke="url(#headerGradient)" strokeWidth="6" fill="none" opacity="0.6" strokeLinecap="round">
        <animate attributeName="d" 
          values="
            M 65 170 Q 90 155, 115 170 Q 140 185, 165 170 Q 190 155, 215 170;
            M 65 170 Q 90 185, 115 170 Q 140 155, 165 170 Q 190 185, 215 170;
            M 65 170 Q 90 155, 115 170 Q 140 185, 165 170 Q 190 155, 215 170
          "
          dur="3s" repeatCount="indefinite"/>
      </path>
    </svg>
  </div>
  <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
    StreamFlow
  </span>
</Link>