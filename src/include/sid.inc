; SID Sound Chip Definitions
; All SID registers and constants

; === SID BASE ADDRESS ===
SID_BASE        = $d400

; === VOICE 1 REGISTERS ===
SID_V1_FREQ_LO  = $d400    ; Voice 1 frequency low byte
SID_V1_FREQ_HI  = $d401    ; Voice 1 frequency high byte
SID_V1_PW_LO    = $d402    ; Voice 1 pulse width low byte
SID_V1_PW_HI    = $d403    ; Voice 1 pulse width high byte
SID_V1_CTRL     = $d404    ; Voice 1 control register
SID_V1_AD       = $d405    ; Voice 1 attack/decay
SID_V1_SR       = $d406    ; Voice 1 sustain/release

; === VOICE 2 REGISTERS ===
SID_V2_FREQ_LO  = $d407    ; Voice 2 frequency low byte
SID_V2_FREQ_HI  = $d408    ; Voice 2 frequency high byte
SID_V2_PW_LO    = $d409    ; Voice 2 pulse width low byte
SID_V2_PW_HI    = $d40a    ; Voice 2 pulse width high byte
SID_V2_CTRL     = $d40b    ; Voice 2 control register
SID_V2_AD       = $d40c    ; Voice 2 attack/decay
SID_V2_SR       = $d40d    ; Voice 2 sustain/release

; === VOICE 3 REGISTERS ===
SID_V3_FREQ_LO  = $d40e    ; Voice 3 frequency low byte
SID_V3_FREQ_HI  = $d40f    ; Voice 3 frequency high byte
SID_V3_PW_LO    = $d410    ; Voice 3 pulse width low byte
SID_V3_PW_HI    = $d411    ; Voice 3 pulse width high byte
SID_V3_CTRL     = $d412    ; Voice 3 control register
SID_V3_AD       = $d413    ; Voice 3 attack/decay
SID_V3_SR       = $d414    ; Voice 3 sustain/release

; === FILTER REGISTERS ===
SID_FC_LO       = $d415    ; Filter cutoff frequency low byte
SID_FC_HI       = $d416    ; Filter cutoff frequency high byte
SID_RES_FILT    = $d417    ; Resonance/filter routing
SID_MODE_VOL    = $d418    ; Filter mode/volume

; === PADDLE REGISTERS ===
SID_POTX        = $d419    ; Paddle X value
SID_POTY        = $d41a    ; Paddle Y value
SID_OSC3        = $d41b    ; Voice 3 oscillator output
SID_ENV3        = $d41c    ; Voice 3 envelope output

; === CONTROL REGISTER BITS ===
SID_CTRL_GATE   = $01      ; Gate bit
SID_CTRL_SYNC   = $02      ; Sync bit
SID_CTRL_RING   = $04      ; Ring modulation
SID_CTRL_TEST   = $08      ; Test bit
SID_CTRL_TRI    = $10      ; Triangle waveform
SID_CTRL_SAW    = $20      ; Sawtooth waveform
SID_CTRL_PULSE  = $40      ; Pulse waveform
SID_CTRL_NOISE  = $80      ; Noise waveform

; === FILTER BITS ===
SID_FILT_V1     = $01      ; Filter voice 1
SID_FILT_V2     = $02      ; Filter voice 2
SID_FILT_V3     = $04      ; Filter voice 3
SID_FILT_EXT    = $08      ; Filter external input
SID_FILT_LP     = $10      ; Low pass filter
SID_FILT_BP     = $20      ; Band pass filter
SID_FILT_HP     = $40      ; High pass filter
SID_FILT_3OFF   = $80      ; Voice 3 disconnect

; === ENVELOPE VALUES ===
ENV_ATTACK_2MS  = $00      ; 2ms attack
ENV_ATTACK_8MS  = $01      ; 8ms attack
ENV_ATTACK_16MS = $02      ; 16ms attack
ENV_ATTACK_32MS = $03      ; 32ms attack
ENV_ATTACK_64MS = $04      ; 64ms attack

ENV_DECAY_6MS   = $00      ; 6ms decay
ENV_DECAY_24MS  = $10      ; 24ms decay
ENV_DECAY_48MS  = $20      ; 48ms decay
ENV_DECAY_96MS  = $30      ; 96ms decay

ENV_SUSTAIN_MAX = $f0      ; Maximum sustain
ENV_SUSTAIN_MED = $80      ; Medium sustain
ENV_SUSTAIN_LOW = $40      ; Low sustain

ENV_RELEASE_6MS = $00      ; 6ms release
ENV_RELEASE_24MS= $01      ; 24ms release
ENV_RELEASE_48MS= $02      ; 48ms release
ENV_RELEASE_96MS= $03      ; 96ms release

; === FREQUENCY CONSTANTS (NTSC) ===
; Note frequencies for equal temperament
FREQ_C1         = $0117    ; C-1
FREQ_CS1        = $0127    ; C#1
FREQ_D1         = $0139    ; D-1
FREQ_DS1        = $014B    ; D#1
FREQ_E1         = $015F    ; E-1
FREQ_F1         = $0174    ; F-1
FREQ_FS1        = $018A    ; F#1
FREQ_G1         = $01A1    ; G-1
FREQ_GS1        = $01BA    ; G#1
FREQ_A1         = $01D4    ; A-1
FREQ_AS1        = $01F0    ; A#1
FREQ_B1         = $020E    ; B-1

; Higher octaves multiply by 2
FREQ_C2         = $022E    ; C-2
FREQ_C3         = $045C    ; C-3
FREQ_C4         = $08B8    ; C-4 (Middle C)
FREQ_C5         = $1170    ; C-5