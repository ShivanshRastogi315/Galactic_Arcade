// client/src/components/HyperspaceBackground.jsx
import { useEffect, useRef } from 'react';

const HyperspaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width, height;
    let stars = [];
    const numStars = 400; // Number of stars in the galaxy
    let speed = 0.5;      // Starting speed

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // 3D Star Class
    class Star {
      constructor() {
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = Math.random() * width;
        this.pz = this.z; // Previous Z for drawing streaks
      }
      
      update() {
        this.z -= speed;
        // If the star goes past the camera, reset it far away
        if (this.z < 1) {
          this.z = width;
          this.x = (Math.random() - 0.5) * width * 2;
          this.y = (Math.random() - 0.5) * height * 2;
          this.pz = this.z;
        }
      }
      
      draw() {
        // Project 3D coordinates to 2D screen
        const sx = (this.x / this.z) * (width / 2) + width / 2;
        const sy = (this.y / this.z) * (height / 2) + height / 2;
        const px = (this.x / this.pz) * (width / 2) + width / 2;
        const py = (this.y / this.pz) * (height / 2) + height / 2;

        this.pz = this.z;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        
        // Stars fade in as they get closer, tinted with TRON Cyan
        const opacity = 1 - this.z / width;
        ctx.strokeStyle = `rgba(15, 224, 255, ${opacity})`; 
        ctx.lineWidth = (1 - this.z / width) * 4;
        ctx.stroke();
      }
    }

    for (let i = 0; i < numStars; i++) stars.push(new Star());

    const render = () => {
      // Dark background with a slight trail effect to make the stars "streak"
      ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Accelerate up to WARP SPEED!
      if (speed < 18) speed += 0.1; 

      stars.forEach(star => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
};

export default HyperspaceBackground;