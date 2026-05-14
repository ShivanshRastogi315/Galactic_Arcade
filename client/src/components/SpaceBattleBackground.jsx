import { useEffect, useRef } from 'react';

const SpaceBattleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    document.body.style.backgroundColor = '#000000';
    let animationFrameId;
    
    let width, height;
    let frameCount = 0;

    // Mouse tracking for interactivity
    let mouseX = window.innerWidth / 2;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- GAME ENTITIES ---
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: Math.random() * 2 + 0.5,
      size: Math.random() * 2
    }));

    let enemies = [];
    let lasers = [];
    let particles = [];

    let player = { x: width / 2, y: height - 100 };

    // --- DRAWING FUNCTIONS ---

    // 1. THE NEW X-WING PLAYER SHIP
    // 1. THE HEAVY X-WING (Based on your reference image)
    const drawPlayerShip = (x, y) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Setup Glow & Colors
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0fe0ff';
      ctx.strokeStyle = '#0fe0ff';
      ctx.fillStyle = '#051515'; // Dark metallic inner color
      ctx.lineJoin = 'round';

      // WINGS
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Right Wing
      ctx.moveTo(8, -5); ctx.lineTo(35, 0); ctx.lineTo(35, 12); ctx.lineTo(8, 12);
      // Left Wing
      ctx.moveTo(-8, -5); ctx.lineTo(-35, 0); ctx.lineTo(-35, 12); ctx.lineTo(-8, 12);
      ctx.fill(); ctx.stroke();

      // HEAVY INNER THRUSTERS (The massive cylinders next to the body)
      ctx.fillStyle = 'rgba(15, 224, 255, 0.2)';
      ctx.fillRect(4, 2, 10, 16);  // Right inner engine
      ctx.fillRect(-14, 2, 10, 16); // Left inner engine
      ctx.strokeRect(4, 2, 10, 16);
      ctx.strokeRect(-14, 2, 10, 16);

      // OUTER THRUSTERS (The cylinders on the wingtips)
      ctx.fillRect(28, 5, 8, 14);   // Right outer engine
      ctx.fillRect(-36, 5, 8, 14);  // Left outer engine
      ctx.strokeRect(28, 5, 8, 14);
      ctx.strokeRect(-36, 5, 8, 14);

      // LASER CANNONS (Long poles sticking out of the outer thrusters)
      ctx.beginPath();
      ctx.moveTo(32, 5); ctx.lineTo(32, -25);
      ctx.moveTo(-32, 5); ctx.lineTo(-32, -25);
      ctx.lineWidth = 2;
      ctx.stroke();

      // MAIN FUSELAGE (Thick, heavy nose)
      ctx.lineWidth = 2;
      ctx.fillStyle = '#051515';
      ctx.beginPath();
      ctx.moveTo(0, -35);  // Nose Tip
      ctx.lineTo(6, -10);  // Widens
      ctx.lineTo(6, 12);   // Base right
      ctx.lineTo(-6, 12);  // Base left
      ctx.lineTo(-6, -10); // Left widen
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // COCKPIT
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(4, -5);
      ctx.lineTo(-4, -5);
      ctx.closePath();
      ctx.fillStyle = '#0fe0ff'; // Glowing cyan glass
      ctx.fill();

      // 4x ENGINE FLAMES
      ctx.beginPath();
      ctx.moveTo(-9, 18);  ctx.lineTo(-9, 18 + Math.random() * 25);  // Inner L
      ctx.moveTo(9, 18);   ctx.lineTo(9, 18 + Math.random() * 25);   // Inner R
      ctx.moveTo(-32, 19); ctx.lineTo(-32, 19 + Math.random() * 15); // Outer L
      ctx.moveTo(32, 19);  ctx.lineTo(32, 19 + Math.random() * 15);  // Outer R
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
    };
    // 2. ENEMY TIE-FIGHTERS
    const drawEnemyShip = (enemy) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff003c';
      ctx.strokeStyle = '#ff003c';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(-12, -15); ctx.lineTo(-12, 15); // Left Panel
      ctx.moveTo(12, -15);  ctx.lineTo(12, 15);  // Right Panel
      ctx.moveTo(-12, 0);   ctx.lineTo(12, 0);   // Crossbar
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 60, 0.2)';
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const spawnExplosion = (x, y) => {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1,
          color: Math.random() > 0.5 ? '#ff003c' : '#FFE81F' 
        });
      }
    };

    // --- MAIN ANIMATION LOOP ---
    const render = () => {
      // 1. FORCE PURE BLACK BACKGROUND (Removes the blue bleed)
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; 
      ctx.fillRect(0, 0, width, height);
      frameCount++;

      // Stars
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 0;
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > height) { star.y = 0; star.x = Math.random() * width; }
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Player Movement (Smooth follow)
      player.x += (mouseX - player.x) * 0.1;
      player.y = height - 80;
      drawPlayerShip(player.x, player.y);

      // Auto-Fire Lasers (Fires from the center)
      if (frameCount % 15 === 0) {
        lasers.push({ x: player.x, y: player.y - 35, speed: 12 });
      }

      // Update Lasers
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0fe0ff';
      ctx.fillStyle = '#0fe0ff';
      for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.y -= l.speed;
        ctx.fillRect(l.x - 1, l.y, 3, 15);
        if (l.y < -20) lasers.splice(i, 1);
      }

      // Spawn Enemies
      if (frameCount % 80 === 0) {
        enemies.push({ x: Math.random() * (width - 60) + 30, y: -30, speed: Math.random() * 1.5 + 1 });
      }

      // Update Enemies & Collisions
      for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed;
        drawEnemyShip(e);

        for (let j = lasers.length - 1; j >= 0; j--) {
          let l = lasers[j];
          if (Math.abs(l.x - e.x) < 20 && Math.abs(l.y - e.y) < 20) {
            spawnExplosion(e.x, e.y);
            enemies.splice(i, 1);
            lasers.splice(j, 1);
            break;
          }
        }
        if (enemies[i] && enemies[i].y > height + 30) enemies.splice(i, 1);
      }

      // Update Particles
      ctx.shadowBlur = 5;
      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) particles.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        backgroundColor: '#000000', // Forces pure black space
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} 
    />
  );
};

export default SpaceBattleBackground;