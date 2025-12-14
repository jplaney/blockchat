# Design Guidelines: Parent-Child Voice Chat App

## Design Approach

**Selected Approach:** Design System - Material Design 3  
**Justification:** This is a utility-focused application requiring clarity, simplicity, and child-friendly interactions. Material Design provides excellent support for states, accessibility, and clear visual hierarchy - perfect for a tool that needs to work reliably for both parent and child users.

**Core Principles:**
1. **Simplicity First** - Every element must have clear purpose
2. **Child-Friendly** - Large touch targets, obvious states, forgiving interactions
3. **Status Clarity** - Always show what's happening (connecting, connected, muted, etc.)
4. **Zero Learning Curve** - Intuitive enough for immediate use

---

## Typography

**Font Family:** Inter or Roboto (via Google Fonts CDN)

**Scale:**
- Hero Text (Status): text-4xl (36px) - bold
- Primary Actions: text-lg (18px) - semibold
- Labels: text-base (16px) - medium
- Helper Text: text-sm (14px) - regular

**Hierarchy:**
- Connection status is the dominant visual element
- Control labels are secondary
- Helper text is tertiary (hints, instructions)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8, 12, 16** consistently
- Standard gap: gap-6
- Section padding: p-8 or p-12
- Button padding: px-8 py-4
- Compact spacing: gap-4

**Container Strategy:**
- Single centered container: max-w-md (448px)
- Centered vertically and horizontally on viewport
- Full mobile width with px-4 on small screens

**Layout Sections (Top to Bottom):**

1. **Header Area** (text-center, mb-8)
   - App title
   - Simple tagline

2. **PIN Entry Screen** (initial state)
   - Centered card container
   - Large 4-digit PIN input
   - Single "Join Call" button below

3. **Main Chat Interface** (post-PIN)
   - **Status Display** (mb-12)
     - Large status text with icon
     - Animated connection indicator
     - Participant name display
   
   - **Audio Controls** (space-y-6)
     - Visual audio level meter (full width bars)
     - Mute/Unmute toggle (extra large, prominent)
     - Volume slider with icons
   
   - **Footer Controls** (mt-8, pt-6, border-t)
     - Disconnect button (secondary style)
     - Keyboard shortcut hint

---

## Component Library

### Core Components

**PIN Input**
- 4 large square boxes in a row (flex, gap-4)
- Each box: w-16 h-16 with centered single digit
- Large text (text-3xl)
- Clear focus states with ring
- Auto-advance to next box on digit entry

**Status Indicator**
- Icon + text combination
- States: "Waiting...", "Connecting...", "Connected!", "Reconnecting..."
- Animated pulse for waiting/connecting states
- Use Heroicons for status icons (phone, signal, etc.)

**Audio Level Meter**
- Horizontal bar visualization
- Multiple bars showing real-time audio input
- Height: h-12
- Segmented appearance (5-7 bars with gap-1)

**Primary Button (Mute Toggle)**
- Extra large: px-12 py-6
- Icon + text label
- Rounded: rounded-2xl
- Prominent shadow when active
- Clear muted vs unmuted states (different icons)

**Volume Slider**
- Range input with custom styling
- Icon on left (volume-off) and right (volume-up)
- Width: w-full
- Track height: h-2
- Large thumb for easy dragging

**Secondary Button (Disconnect)**
- Smaller than primary: px-6 py-3
- Rounded: rounded-xl
- Subdued appearance

### Cards/Containers

**Main Card**
- Container: rounded-3xl with shadow-xl
- Padding: p-12 on desktop, p-8 on mobile
- Subtle border

---

## Interaction Patterns

**State Visibility**
- Always show current connection state prominently
- Mute status must be impossible to miss (icon + text + visual treatment)
- Loading states use gentle animation (pulse, not spinner)

**Touch Targets**
- Minimum size: 48x48px (Tailwind h-12)
- Extra padding around interactive elements
- Clear hover states (not just pointer cursor)

**Feedback**
- Instant visual feedback for all clicks
- Button press animations (scale-95 on active)
- Subtle success confirmations
- Error messages in friendly language

**Keyboard Support**
- Spacebar for mute toggle (always available when connected)
- Enter to submit PIN
- Tab navigation through all controls
- Visible focus rings (ring-2 ring-offset-2)

---

## Special Considerations

**Child-Friendly Adaptations**
- No small text or fine details
- Generous spacing prevents mis-clicks
- Clear iconography (supplement all with text labels)
- Forgiving PIN entry (allow corrections easily)
- No timeout on PIN entry screen

**Audio Visualization**
- Real-time audio level bars provide feedback that mic is working
- Visual confirmation when speaking (bars animate)
- Helps child understand when they're being heard

**Error Handling**
- Friendly error messages: "Oops! That PIN didn't work. Try again?"
- Automatic retry on connection issues
- Clear "Reconnecting..." state rather than failure

**Accessibility**
- All controls labeled for screen readers
- High contrast between text and backgrounds
- Focus visible on all interactive elements
- No color-only indicators (always pair with icons/text)

---

## Images

**No images required** for this utility application. The interface relies on icons, status indicators, and clear typography for communication. Keep it clean and distraction-free.