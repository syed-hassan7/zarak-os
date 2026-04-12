import React, { useEffect, useRef } from 'react';

export default function DigitalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.parentElement?.clientHeight || window.innerHeight;

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    // Node Properties
    const MAX_NODES = Math.floor((width * height) / 15000); // Responsive density
    const CONNECTION_DISTANCE = 150;
    
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }
    
    const nodes: Node[] = [];
    
    for (let i = 0; i < MAX_NODES; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4, // Slow drift
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 1.5 + 0.5
        });
    }

    const draw = () => {
      // Clear with very slight transparency for trail effect
      ctx.fillStyle = 'rgba(5, 7, 10, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Accent color matching the theme
      const accentRbg = '45, 212, 191'; 
      const warnRbg = '192, 132, 252';

      // Update and Draw Nodes
      for(let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          
          node.x += node.vx;
          node.y += node.vy;
          
          // Bounce off edges
          if(node.x < 0 || node.x > width) node.vx *= -1;
          if(node.y < 0 || node.y > height) node.vy *= -1;
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${accentRbg}, 0.8)`;
          ctx.fill();
          
          // Connect Nodes
          for(let j = i + 1; j < nodes.length; j++) {
              const nodeB = nodes[j];
              const dx = node.x - nodeB.x;
              const dy = node.y - nodeB.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if(distance < CONNECTION_DISTANCE) {
                  const opacity = 1 - (distance / CONNECTION_DISTANCE);
                  ctx.beginPath();
                  ctx.moveTo(node.x, node.y);
                  ctx.lineTo(nodeB.x, nodeB.y);
                  
                  // Mix colors slightly
                  const isWarn = (i + j) % 5 === 0;
                  ctx.strokeStyle = `rgba(${isWarn ? warnRbg : accentRbg}, ${opacity * 0.3})`;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
              }
          }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-os-bg overflow-hidden pointer-events-none">
      {/* Background Soft Gradients */}
      <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-os-accent/5 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-os-warn/5 rounded-full blur-[150px] mix-blend-screen" />
      
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />
    </div>
  );
}
