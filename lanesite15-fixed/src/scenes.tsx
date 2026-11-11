import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ANTON, INTER } from "./fonts15";
import { Big, C, clamp, Confetti, Cursor, Glow, Icon, Label, LogoMark, Phone, TypeDots, usePop } from "./ui";

const Bubble: React.FC<{ text: string; out?: boolean; delay?: number }> = ({ text, out = false, delay = 0 }) => {
  const s = usePop(delay);
  return (
    <div
      style={{
        alignSelf: out ? "flex-end" : "flex-start",
        maxWidth: 220,
        transform: `scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 8}px)`,
        opacity: s,
        transformOrigin: out ? "bottom right" : "bottom left",
      }}
    >
      <div
        style={{
          background: out ? C.orange : "#F1EFE9",
          color: out ? "#fff" : "#121214",
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: 1.35,
          padding: "9px 12px",
          borderRadius: out ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {text}
      </div>
      <div style={{ fontFamily: INTER, fontSize: 8, color: C.dim, marginTop: 3, textAlign: out ? "right" : "left" }}>now</div>
    </div>
  );
};

const ChatShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0, background: "#101014", display: "flex", flexDirection: "column" }}>
    <div
      style={{
        height: 80,
        background: "#151519",
        borderBottom: `1px solid ${C.line}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "18px 14px 0",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: C.orange,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 14,
          color: "#fff",
        }}
      >
        Z
      </div>
      <div>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 14, color: C.white }}>Zara</div>
        <div style={{ fontFamily: INTER, fontSize: 9, color: C.green }}>● online</div>
      </div>
      <div style={{ marginLeft: "auto", color: C.dim, transform: "rotate(180deg)" }}>
        <Icon name="arrow" size={16} />
      </div>
    </div>
    <div
      style={{
        flex: 1,
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        backgroundImage: "radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      {children}
    </div>
  </div>
);

export const ChatScene: React.FC = () => {
  const f = useCurrentFrame();
  const phoneIn = interpolate(f, [0, 8], [70, 0], clamp);
  const zoom = interpolate(f, [48, 56, 70], [1, 1.06, 1.02], clamp);
  const big1 = usePop(10, { damping: 11, stiffness: 200 });
  const big2 = usePop(50, { damping: 10, stiffness: 240 });
  const scrim = interpolate(f, [48, 54], [0, 0.55], clamp);
  return (
    <AbsoluteFill>
      <Glow x={220} y={-120} size={620} opacity={0.18} />
      <div style={{ position: "absolute", top: 36, left: 24, right: 24, display: "flex", justifyContent: "space-between" }}>
        <Label>2:07 AM</Label>
        <Label style={{ color: C.orange }}>1 NEW MESSAGE</Label>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 110,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${phoneIn}px) scale(${zoom})`,
        }}
      >
        <Phone>
          <ChatShell>
            {f < 6 ? (
              <div style={{ alignSelf: "flex-start", background: "#1C1C22", borderRadius: 16, padding: "12px 14px" }}>
                <TypeDots />
              </div>
            ) : (
              <Bubble text="You built this?" out={false} delay={6} />
            )}
            {f >= 48 && <Bubble text="Last night." out={true} delay={48} />}
            {f >= 70 && (
              <div style={{ alignSelf: "flex-start", background: "#1C1C22", borderRadius: 16, padding: "10px 12px" }}>
                <TypeDots />
              </div>
            )}
          </ChatShell>
        </Phone>
      </div>
      {f < 48 && f >= 10 && (
        <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", transform: `scale(${0.8 + 0.2 * big1})`, opacity: big1 }}>
          <Big size={42}>You built this?</Big>
        </div>
      )}
      {f >= 48 && <AbsoluteFill style={{ background: `rgba(0,0,0,${scrim})` }} />}
      {f >= 48 && (
        <div
          style={{
            position: "absolute",
            top: 118,
            left: 0,
            right: 0,
            textAlign: "center",
            transform: `scale(${0.7 + 0.3 * big2}) rotate(${(1 - big2) * -4}deg)`,
            opacity: big2,
          }}
        >
          <Big size={80} color={C.orange}>Last night.</Big>
        </div>
      )}
      {f >= 56 && (
        <div style={{ position: "absolute", top: 232, left: 0, right: 0, textAlign: "center", opacity: interpolate(f, [56, 64], [0, 1], clamp) }}>
          <Label style={{ color: C.white }}>NO BRIEF · NO CALL · ONE EVENING</Label>
        </div>
      )}
    </AbsoluteFill>
  );
};

const MiniRow: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `1px solid ${C.line}` }}>
    <span style={{ fontFamily: INTER, fontSize: 9, color: C.dim }}>{a}</span>
    <span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 700, color: C.white }}>{b}</span>
  </div>
);

const MiniMenu: React.FC = () => (
  <div>
    <MiniRow a="Milk bread" b="$5" />
    <MiniRow a="Fudge cake" b="$48" />
    <MiniRow a="Patties" b="$12" />
  </div>
);

const MiniPrices: React.FC = () => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
    <div style={{ fontFamily: ANTON, fontSize: 36, lineHeight: 1, color: C.orange }}>$5</div>
    <div style={{ fontFamily: INTER, fontSize: 7, color: C.dim }}>per item</div>
    <div style={{ marginLeft: "auto", fontFamily: ANTON, fontSize: 22, color: C.white }}>$48</div>
  </div>
);

const MiniBookings: React.FC = () => (
  <div>
    <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
      {["M", "T", "W", "T", "F"].map((d, i) => (
        <div
          key={i}
          style={{
            width: 23,
            height: 20,
            borderRadius: 5,
            background: i === 2 ? C.orange : C.panel2,
            fontFamily: INTER,
            fontSize: 8,
            color: i === 2 ? "#fff" : C.dim,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {d}
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 3 }}>
      {["11:00", "4:30", "7:00"].map((t, i) => (
        <div
          key={i}
          style={{
            padding: "4px 5px",
            borderRadius: 5,
            background: i === 1 ? C.white : C.panel2,
            color: i === 1 ? "#111" : C.dim,
            fontFamily: INTER,
            fontSize: 7,
          }}
        >
          {t}
        </div>
      ))}
    </div>
  </div>
);

const MiniDash: React.FC = () => (
  <div style={{ display: "flex", gap: 4 }}>
    {[
      ["1", "site"],
      ["18", "inq"],
      ["100", "credits"],
    ].map(([n, l], i) => (
      <div key={i} style={{ flex: 1, background: C.panel2, borderRadius: 8, padding: "5px 4px" }}>
        <div style={{ fontFamily: ANTON, fontSize: 18, color: i === 1 ? C.orange : C.white }}>{n}</div>
        <div style={{ fontFamily: INTER, fontSize: 6, color: C.dim }}>{l}</div>
      </div>
    ))}
  </div>
);

const Tile: React.FC<{ title: string; icon: string; delay: number; rotate: number; children: React.ReactNode }> = ({
  title,
  icon,
  delay,
  rotate,
  children,
}) => {
  const s = usePop(delay, { damping: 11, stiffness: 230 });
  return (
    <div
      style={{
        width: 190,
        height: 190,
        borderRadius: 26,
        background: C.panel,
        border: `1px solid ${C.line}`,
        padding: 14,
        opacity: Math.min(1, s),
        transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + 0.3 * s}) rotate(${(1 - s) * rotate}deg)`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(255,107,53,.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.orange,
          }}
        >
          <Icon name={icon} size={20} />
        </div>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#05130a",
            opacity: Math.min(1, s),
            transform: `scale(${s})`,
          }}
        >
          <Icon name="check" size={14} strokeWidth={3} />
        </div>
      </div>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 17, letterSpacing: 1, color: C.white, textTransform: "uppercase" }}>{title}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export const GridScene: React.FC = () => {
  const f = useCurrentFrame();
  const titleIn = usePop(2);
  const allIn = usePop(108, { damping: 9, stiffness: 260 });
  return (
    <AbsoluteFill>
      <Glow x={-120} y={200} size={650} opacity={0.14} />
      <div style={{ position: "absolute", top: 24, left: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: C.orange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 11,
            color: "#fff",
          }}
        >
          Z
        </div>
        <div
          style={{
            background: "#F1EFE9",
            color: "#111",
            fontFamily: INTER,
            fontWeight: 600,
            fontSize: 12,
            padding: "7px 10px",
            borderRadius: 12,
          }}
        >
          Whole site?
        </div>
      </div>
      <div style={{ position: "absolute", top: 26, right: 20, textAlign: "right" }}>
        <Label>02 / 04</Label>
        <Label style={{ color: C.orange }}>THE PROOF</Label>
      </div>
      <div style={{ position: "absolute", top: 96, left: 0, right: 0, textAlign: "center", transform: `scale(${0.8 + 0.2 * titleIn})`, opacity: titleIn }}>
        <Big size={52}>Whole site?</Big>
      </div>
      {f < 36 && (
        <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", opacity: 0.08 }}>
          <Big size={220}>?</Big>
        </div>
      )}
      <div style={{ position: "absolute", left: 44, top: 190, display: "grid", gridTemplateColumns: "190px 190px", gap: 12 }}>
        <Tile title="Menu" icon="menu" delay={36} rotate={-4}>
          <MiniMenu />
        </Tile>
        <Tile title="Prices" icon="tag" delay={52} rotate={4}>
          <MiniPrices />
        </Tile>
        <Tile title="Bookings" icon="calendar" delay={72} rotate={4}>
          <MiniBookings />
        </Tile>
        <Tile title="Dashboard" icon="grid" delay={92} rotate={-4}>
          <MiniDash />
        </Tile>
      </div>
      {f >= 108 && <AbsoluteFill style={{ background: "rgba(0,0,0,.38)" }} />}
      {f >= 108 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 600,
            textAlign: "center",
            transform: `scale(${0.7 + 0.3 * allIn})`,
            opacity: allIn,
          }}
        >
          <Big size={68}>
            All of it<span style={{ color: C.orange }}>.</span>
          </Big>
        </div>
      )}
      <Confetti start={108} />
    </AbsoluteFill>
  );
};

export const GlitchScene: React.FC = () => {
  const f = useCurrentFrame();
  const click = f >= 18 && f <= 22 ? 1 - Math.abs(f - 20) / 2 : 0;
  const x = interpolate(f, [6, 18], [400, 240], clamp);
  const y = interpolate(f, [6, 18], [740, 628], clamp);
  const jitter = Math.sin(f * 2.2) * 3;
  return (
    <AbsoluteFill style={{ background: "#050506" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 4px)",
          opacity: 0.5,
        }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: (f * 17 + i * 211) % 854,
            left: (f * 11 + i * 137) % 480,
            width: ((f * 23 + i * 97) % 300) + 40,
            height: 2 + i * 2,
            background: i === 0 ? C.orange : C.white,
            opacity: 0.18,
          }}
        />
      ))}
      <div style={{ position: "absolute", top: 30, left: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: C.orange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 11,
            color: "#fff",
          }}
        >
          Z
        </div>
        <div style={{ background: "#F1EFE9", color: "#111", fontFamily: INTER, fontWeight: 600, fontSize: 12, padding: "7px 10px", borderRadius: 12 }}>
          No way.
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", transform: `translateX(${jitter}px)` }}>
        <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-52%)", fontFamily: ANTON, fontSize: 118, color: "#FF3B30", opacity: 0.55 }}>
          NO WAY.
        </div>
        <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-48%)", fontFamily: ANTON, fontSize: 118, color: "#00E5FF", opacity: 0.55 }}>
          NO WAY.
        </div>
        <Big size={118}>No way.</Big>
      </div>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 600,
          width: 180,
          height: 56,
          borderRadius: 28,
          background: f >= 18 ? C.orange : C.panel,
          border: `1px solid ${f >= 18 ? C.orange : C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 1.5,
          color: f >= 18 ? "#111" : C.white,
          transform: `scale(${1 - 0.08 * click})`,
          boxShadow: f >= 18 ? "0 0 30px rgba(255,107,53,.5)" : "none",
        }}
      >
        PROVE IT
      </div>
      <Cursor x={x} y={y} press={click} opacity={1} />
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center" }}>
        <Label>ZARA IS TYPING…</Label>
      </div>
    </AbsoluteFill>
  );
};

const TEXT = "Maple Bakery in Park Slope. Fresh bread and cakes, open 7am to 10pm.";

export const BuildInputScene: React.FC = () => {
  const f = useCurrentFrame();
  const typed = TEXT.slice(0, Math.floor(interpolate(f, [8, 44], [0, TEXT.length], clamp)));
  const focus = f >= 8 && f < 44;
  const click = f >= 48 ? Math.max(0, 1 - Math.abs(f - 50) / 3) : 0;
  const cursorPress = Math.max(
    f >= 8 && f <= 12 ? 1 - Math.abs(f - 10) / 2 : 0,
    f >= 48 && f <= 52 ? 1 - Math.abs(f - 50) / 2 : 0
  );
  const x = interpolate(f, [2, 8, 42, 48], [400, 250, 250, 240], clamp);
  const y = interpolate(f, [2, 8, 42, 48], [760, 240, 240, 650], clamp);
  const ripple = interpolate(f, [48, 55], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Glow x={240} y={-100} size={600} opacity={0.15} />
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, textAlign: "center" }}>
        <Label style={{ color: C.orange }}>STEP 1 · DESCRIBE</Label>
        <Big size={28} style={{ marginTop: 4 }}>I described my bakery.</Big>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center" }}>
        <Phone>
          <div style={{ position: "absolute", inset: 0, background: "#F7F1E5", padding: "22px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
                <div style={{ width: 4, height: 12, borderRadius: 2, background: "#101D19" }} />
                <div style={{ width: 4, height: 18, borderRadius: 2, background: C.orange }} />
                <div style={{ width: 4, height: 12, borderRadius: 2, background: "#101D19" }} />
              </div>
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 12, color: "#101D19" }}>LaneSite</div>
              <div style={{ marginLeft: "auto", fontFamily: INTER, fontSize: 8, color: "#8A8175" }}>NEW WEBSITE</div>
            </div>
            <div style={{ marginTop: 22, fontFamily: INTER, fontWeight: 800, fontSize: 7, letterSpacing: 1.6, color: "#A65B32" }}>DESCRIBE YOUR SHOP</div>
            <div
              style={{
                marginTop: 6,
                height: 96,
                borderRadius: 10,
                background: "#fff",
                border: `1.5px solid ${focus ? C.orange : "#E4DCCB"}`,
                padding: "10px 11px",
                fontFamily: INTER,
                fontSize: 11,
                lineHeight: 1.5,
                color: "#2A241D",
                overflow: "hidden",
                boxShadow: focus ? "0 0 0 3px rgba(255,107,53,.12)" : "none",
              }}
            >
              {typed}
              <span style={{ opacity: f % 10 < 5 ? 1 : 0, color: C.orange }}>|</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {["Bakery", "Salon", "Pharmacy"].map((c, i) => (
                <div
                  key={c}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 999,
                    background: i === 0 ? C.orange : "#fff",
                    color: i === 0 ? "#fff" : "#6B6154",
                    fontFamily: INTER,
                    fontWeight: 600,
                    fontSize: 8,
                    border: i === 0 ? "none" : "1px solid #E4DCCB",
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 26,
                height: 44,
                borderRadius: 12,
                background: f >= 48 ? "#E85A28" : C.orange,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: INTER,
                fontWeight: 800,
                fontSize: 11,
                color: "#fff",
                letterSpacing: 1,
                transform: `scale(${1 - 0.06 * click})`,
                boxShadow: "0 10px 24px rgba(255,107,53,.35)",
              }}
            >
              BUILD MY SITE <Icon name="arrow" size={14} color="#fff" />
            </div>
            {f >= 48 && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 26,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: `2px solid ${C.orange}`,
                  transform: `translateX(-50%) scale(${1 + ripple * 5})`,
                  opacity: 0.6 * (1 - ripple),
                }}
              />
            )}
          </div>
        </Phone>
      </div>
      <Cursor x={x} y={y} press={Math.min(1, cursorPress)} />
    </AbsoluteFill>
  );
};

const ROWS = [
  ["Reading your brief", "Maple Bakery · Park Slope"],
  ["Choosing colors", "warm crust palette"],
  ["Writing pages", "Home · Menu · Contact"],
  ["Adding bookings", "order form · dashboard"],
  ["Testing in browser", "0 broken links"],
  ["Publishing", "maple-bakery.lanesite.pro"],
];

const CheckRow: React.FC<{ a: string; b: string; delay: number }> = ({ a, b, delay }) => {
  const s = usePop(delay, { damping: 14, stiffness: 240 });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 0",
        borderBottom: "1px solid #EDE7DA",
        opacity: Math.min(1, s),
        transform: `translateX(${(1 - s) * -14}px)`,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: C.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#04120a",
          transform: `scale(${s})`,
          flex: "none",
        }}
      >
        <Icon name="check" size={12} strokeWidth={3} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 10, color: "#1A1814" }}>{a}</div>
        <div style={{ fontFamily: INTER, fontSize: 8, color: "#8A8175" }}>{b}</div>
      </div>
    </div>
  );
};

const DashboardCard: React.FC = () => {
  const s = usePop(38, { damping: 12, stiffness: 220 });
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        top: 640,
        width: 230,
        background: "#fff",
        borderRadius: 18,
        padding: "12px 14px",
        boxShadow: "0 20px 50px rgba(0,0,0,.45)",
        opacity: Math.min(1, s),
        transform: `translateY(${(1 - s) * 30}px)`,
        zIndex: 90,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 8, letterSpacing: 1.5, color: "#8A7B6B" }}>YOUR DASHBOARD</div>
          <div style={{ fontFamily: ANTON, fontSize: 30, lineHeight: 1, color: "#151515", marginTop: 4 }}>
            18 <span style={{ fontFamily: INTER, fontWeight: 700, fontSize: 10 }}>inquiries</span>
          </div>
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(255,107,53,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.orange,
          }}
        >
          <Icon name="bell" size={18} />
        </div>
      </div>
      <div style={{ marginTop: 6, fontFamily: INTER, fontSize: 8, color: "#777" }}>Fresh milk bread × 2 · just now</div>
    </div>
  );
};

const Toast: React.FC = () => {
  const s = usePop(44, { damping: 12, stiffness: 220 });
  return (
    <div
      style={{
        position: "absolute",
        right: 10,
        top: 62,
        width: 214,
        background: "rgba(255,255,255,.98)",
        borderRadius: 16,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 16px 40px rgba(0,0,0,.4)",
        opacity: Math.min(1, s),
        transform: `translateY(${(1 - s) * -20}px)`,
        zIndex: 92,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: "#6B4A33",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: INTER,
          fontWeight: 800,
          fontSize: 13,
          flex: "none",
        }}
      >
        M
      </div>
      <div>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 10, color: "#111" }}>New pickup request</div>
        <div style={{ fontFamily: INTER, fontSize: 8, color: "#6b6b6b" }}>Maple Bakery · now</div>
      </div>
    </div>
  );
};

export const BuildResultScene: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 28) {
    return (
      <AbsoluteFill>
        <Glow x={240} y={-60} size={600} opacity={0.14} />
        <div style={{ position: "absolute", top: 22, left: 0, right: 0, textAlign: "center" }}>
          <Big size={28}>It built everything.</Big>
        </div>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 96,
            width: 400,
            background: "#F7F1E5",
            borderRadius: 22,
            padding: "18px 20px",
            boxShadow: "0 30px 70px rgba(0,0,0,.45)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "2px solid #E8DFD0",
                borderTopColor: C.orange,
                transform: `rotate(${f * 24}deg)`,
              }}
            />
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 9, letterSpacing: 1.5, color: "#A65B32" }}>BUILDING YOUR SITE</div>
            <div style={{ marginLeft: "auto", fontFamily: INTER, fontSize: 8, color: "#8A8175" }}>SPED-UP DEMO</div>
          </div>
          {ROWS.map(([a, b], i) => (
            <CheckRow key={a} a={a} b={b} delay={2 + i * 4} />
          ))}
          <div style={{ marginTop: 12, height: 5, borderRadius: 3, background: "#E8DFD0", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${interpolate(f, [0, 28], [0, 100], clamp)}%`,
                background: C.orange,
                borderRadius: 3,
              }}
            />
          </div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontFamily: INTER, fontSize: 7, color: "#8A8175" }}>5 pages · 1 form · 0 broken links</div>
            <div style={{ fontFamily: INTER, fontSize: 7, color: C.green }}>● LIVE AT MAPLE-BAKERY.LANESITE.PRO</div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Glow x={240} y={-100} size={650} opacity={0.2} />
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, textAlign: "center" }}>
        <Big size={28}>It built everything.</Big>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 100, display: "flex", justifyContent: "center" }}>
        <Phone>
          <Img src={staticFile("lanesite15/maple_site.png")} style={{ width: "100%", display: "block" }} />
          <div
            style={{
              position: "absolute",
              top: 34,
              right: 14,
              padding: "5px 8px",
              borderRadius: 999,
              background: "rgba(61,220,132,.16)",
              border: "1px solid rgba(61,220,132,.5)",
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 8,
              color: "#1B7A45",
              letterSpacing: 1,
            }}
          >
            ● LIVE
          </div>
        </Phone>
      </div>
      <DashboardCard />
      <Toast />
      <Confetti start={28} />
      <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center" }}>
        <Label>MAPLE-BAKERY.LANESITE.PRO</Label>
      </div>
    </AbsoluteFill>
  );
};

export const LinkScene: React.FC = () => {
  const f = useCurrentFrame();
  const cardIn = usePop(8, { damping: 12, stiffness: 230 });
  const x = interpolate(f, [10, 16], [400, 240], clamp);
  const y = interpolate(f, [10, 16], [660, 500], clamp);
  const click = f >= 16 && f <= 20 ? 1 - Math.abs(f - 18) / 2 : 0;
  return (
    <AbsoluteFill>
      <Glow x={-160} y={100} size={620} opacity={0.16} />
      <div style={{ position: "absolute", top: 30, left: 0, right: 0, textAlign: "center" }}>
        <Big size={44}>The link?</Big>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
        <Phone width={280} height={560}>
          {f < 24 ? (
            <ChatShell>
              <Bubble text="The link?" out={false} delay={2} />
              <div
                style={{
                  marginTop: 4,
                  width: 210,
                  background: "#fff",
                  borderRadius: 12,
                  padding: 8,
                  transform: `scale(${0.7 + 0.3 * cardIn})`,
                  opacity: Math.min(1, cardIn),
                  transformOrigin: "top left",
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flex: "none", background: "#F1EFE9" }}>
                    <Img
                      src={staticFile("lanesite15/hero_1500.png")}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 10, color: "#111" }}>Maple Bakery</div>
                    <div style={{ fontFamily: INTER, fontSize: 8, color: "#777", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      maple-bakery.lanesite.pro
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    height: 20,
                    borderRadius: 6,
                    background: C.orange,
                    color: "#fff",
                    fontFamily: INTER,
                    fontWeight: 800,
                    fontSize: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  OPEN SITE
                </div>
              </div>
            </ChatShell>
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#F7F1E5" }}>
              <Img src={staticFile("lanesite15/maple_site.png")} style={{ width: "100%", display: "block" }} />
              <div
                style={{
                  position: "absolute",
                  top: 30,
                  right: 12,
                  padding: "5px 8px",
                  borderRadius: 999,
                  background: "rgba(61,220,132,.16)",
                  border: "1px solid rgba(61,220,132,.5)",
                  fontFamily: INTER,
                  fontWeight: 800,
                  fontSize: 8,
                  color: "#1B7A45",
                }}
              >
                ● LIVE
              </div>
            </div>
          )}
        </Phone>
      </div>
      <Cursor x={x} y={y} press={click} opacity={f < 24 ? 1 : 0} />
    </AbsoluteFill>
  );
};

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const big = usePop(2, { damping: 10, stiffness: 230 });
  const logoIn = usePop(40, { damping: 13, stiffness: 200 });
  const x = interpolate(f, [10, 18], [430, 396], clamp);
  const y = 360;
  const click = f >= 18 && f <= 22 ? 1 - Math.abs(f - 20) / 2 : 0;
  const plane = interpolate(f, [22, 34], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Glow x={190} y={60} size={700} opacity={0.22} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55))" }} />
      <div style={{ position: "absolute", top: 78, left: 0, right: 0, textAlign: "center", transform: `scale(${0.75 + 0.25 * big})`, opacity: big }}>
        <Big size={46}>Comment</Big>
        <Big size={96} color={C.orange} style={{ marginTop: -4 }}>Link.</Big>
      </div>
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 330,
          width: 380,
          height: 64,
          borderRadius: 32,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 10,
          boxShadow: "0 24px 60px rgba(0,0,0,.45)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#2A231D",
            color: "#fff",
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          M
        </div>
        <div style={{ flex: 1, fontFamily: INTER, fontSize: 18, color: f > 6 ? "#4A4A4A" : "#BBB" }}>{f > 6 ? "link" : "Add a comment…"}</div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: C.orange,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - 0.12 * click})`,
            flex: "none",
          }}
        >
          <Icon name="send" size={17} color="#fff" />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 50 + 330 + plane * 30,
          top: 355 - plane * 80,
          opacity: 1 - plane,
          transform: `rotate(${plane * -20}deg)`,
        }}
      >
        <Icon name="send" size={22} color={C.orange} />
      </div>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,.72)" }}>I'll send it to you.</div>
      </div>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", opacity: Math.min(1, logoIn), transform: `translateY(${(1 - logoIn) * 20}px)` }}>
        <LogoMark scale={1.05} />
        <div
          style={{
            display: "inline-block",
            marginTop: 16,
            border: "1.5px solid rgba(255,255,255,.7)",
            borderRadius: 999,
            padding: "8px 22px",
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: 0.5,
            color: "#fff",
          }}
        >
          lanesite.pro
        </div>
        <div style={{ marginTop: 10 }}>
          <Label>THE WEBSITE BUILDER FOR LOCAL SHOPS</Label>
        </div>
      </div>
      <Confetti start={34} />
      <Cursor x={x} y={y} press={click} opacity={f < 24 ? 1 : 0} />
    </AbsoluteFill>
  );
};
