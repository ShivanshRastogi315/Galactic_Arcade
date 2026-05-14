import { useEffect, useRef } from 'react';

const CyberNexusBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Tracking interactions
    let scrollY = window.scrollY;
    let mouse = { x: width / 2, y: height / 2, radius: 150 };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    // --- NODE CLASS ---
    class DataNode {
      constructor() {
        this.baseX = Math.random() * width;
        this.baseY = Math.random() * (height * 3); // Spread across a tall virtual space
        this.z = Math.random() * 2 + 0.5; // Depth for parallax (0.5 = far, 2.5 = near)
        
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        
        // Colors: Mostly Cyan, some Red, rare Yellow
        const colorChance = Math.random();
        if (colorChance > 0.85) this.color = '#ff003c'; // Sith Red
        else if (colorChance > 0.75) this.color = '#FFE81F'; // Star Wars Yellow
        else this.color = '#0fe0ff'; // TRON Cyan
        
        this.size = this.z * 1.5;
      }

      update() {
        // Drifting movement
        this.baseX += this.vx;
        this.baseY += this.vy;

        // Wrap around X
        if (this.baseX > width + 50) this.baseX = -50;
        if (this.baseX < -50) this.baseX = width + 50;

        // 1. CALCULATE PARALLAX Y POSITION
        // As you scroll down, nodes move UP. Closer nodes move faster.
        let actualY = this.baseY - (scrollY * this.z * 0.4);

        // Wrap around Y (creates infinite scrolling effect)
        const virtualHeight = height * 2;
        actualY = ((actualY % virtualHeight) + virtualHeight) % virtualHeight;
        
        this.x = this.baseX;
        this.y = actualY;

        // 2. MOUSE INTERACTION (Repel)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          
          this.x -= forceDirectionX * force * 5 * this.z;
          this.y -= forceDirectionY * force * 5 * this.z;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;

        // Draw digital crosshairs instead of boring circles
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();

        ctx.restore();
      }
    }

    // Initialize Nodes
    const nodes = [];
    const numNodes = Math.floor((width * height) / 15000); // Responsive amount
    for (let i = 0; i < numNodes; i++) {
      nodes.push(new DataNode());
    }

    // --- RENDER LOOP ---
    const render = () => {
      // Deep space gradient background
      ctx.fillStyle = '#02050a'; // Very dark tech blue/black
      ctx.fillRect(0, 0, width, height);

      // Draw lines between close nodes
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw();

        for (let j = i; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes if they are close
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = nodes[i].color;
            ctx.globalAlpha = 1 - (distance / 120); // Fade out as they get further
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1.0; // Reset
          }
        }

        // Draw line from node to MOUSE
        const mouseDx = nodes[i].x - mouse.x;
        const mouseDy = nodes[i].y - mouse.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        
        if (mouseDistance < mouse.radius) {
          ctx.beginPath();
          ctx.strokeStyle = '#0fe0ff';
          ctx.globalAlpha = 1 - (mouseDistance / mouse.radius);
          ctx.lineWidth = 1;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', // Stays fixed while the page scrolls over it
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0, 
        pointerEvents: 'none' // Allows clicking buttons on the landing page
      }} 
    />
  );
};

export default CyberNexusBackground;