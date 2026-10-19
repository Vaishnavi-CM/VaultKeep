import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// A pinned scrollytelling sequence: the section locks in place while the
// user scrolls, and each beat crossfades in/out tied directly to scroll
// position (a "scrub" timeline) instead of just fading in once on view.
// This is the same core technique agency sites use for "pin and reveal"
// story sections.
const BEATS = [
  { title: "Passwords are the new cash.", sub: "You wouldn't leave your wallet open on a table." },
  { title: "But most people still write them down.", sub: "In notes apps, sticky notes, or reused everywhere." },
  { title: "That's the same risk as a wallet with no clasp.", sub: "One glance, and everything's exposed." },
  { title: "VaultKeep is the wallet that actually locks.", sub: "Encrypted, organized, and only ever yours." },
];

export default function ScrollStory() {
  const containerRef = useRef(null);
  const beatRefs = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const beats = beatRefs.current.filter(Boolean);
      gsap.set(beats, { opacity: 0, y: 40 });
      gsap.set(beats[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${beats.length * 100}%`,
          scrub: 1,
          pin: true,
        },
      });

      beats.forEach((el, i) => {
        if (i === 0) return;
        const prev = beats[i - 1];
        tl.to(prev, { opacity: 0, y: -40, duration: 0.4 }, i - 0.5);
        tl.to(el, { opacity: 1, y: 0, duration: 0.4 }, i - 0.5);
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden flex items-center justify-center bg-grid bg-[size:44px_44px]">
      <div className="absolute w-96 h-96 rounded-full bg-cyan/10 blur-[120px]" />
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        {BEATS.map((beat, i) => (
          <div
            key={beat.title}
            ref={(el) => (beatRefs.current[i] = el)}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight">{beat.title}</h2>
            <p className="text-mist text-lg mt-4">{beat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
