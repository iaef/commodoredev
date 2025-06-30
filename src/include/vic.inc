; VIC-II Video Chip Definitions
; All VIC-II registers and constants

; === VIC-II BASE ADDRESS ===
VIC_BASE        = $d000

; === SPRITE COORDINATES ===
VIC_SPR0_X      = $d000
VIC_SPR0_Y      = $d001
VIC_SPR1_X      = $d002
VIC_SPR1_Y      = $d003
VIC_SPR2_X      = $d004
VIC_SPR2_Y      = $d005
VIC_SPR3_X      = $d006
VIC_SPR3_Y      = $d007
VIC_SPR4_X      = $d008
VIC_SPR4_Y      = $d009
VIC_SPR5_X      = $d00a
VIC_SPR5_Y      = $d00b
VIC_SPR6_X      = $d00c
VIC_SPR6_Y      = $d00d
VIC_SPR7_X      = $d00e
VIC_SPR7_Y      = $d00f

; === SPRITE CONTROL ===
VIC_SPR_HI_X    = $d010    ; Sprites 0-7 X coordinate MSB
VIC_CR1         = $d011    ; Control register 1
VIC_RASTER      = $d012    ; Raster counter
VIC_LPX         = $d013    ; Light pen X coordinate
VIC_LPY         = $d014    ; Light pen Y coordinate
VIC_SPR_ENA     = $d015    ; Sprite enable register
VIC_CR2         = $d016    ; Control register 2
VIC_SPR_EXP_Y   = $d017    ; Sprite Y expansion
VIC_MP          = $d018    ; Memory pointers
VIC_IRR         = $d019    ; Interrupt request register
VIC_IMR         = $d01a    ; Interrupt enable register
VIC_SPR_DP      = $d01b    ; Sprite data priority
VIC_SPR_MC      = $d01c    ; Sprite multicolor
VIC_SPR_EXP_X   = $d01d    ; Sprite X expansion
VIC_SPR_COLL    = $d01e    ; Sprite-sprite collision
VIC_SPR_BG_COLL = $d01f    ; Sprite-background collision

; === COLORS ===
VIC_BORDER_COL  = $d020    ; Border color
VIC_BG_COL0     = $d021    ; Background color 0
VIC_BG_COL1     = $d022    ; Background color 1
VIC_BG_COL2     = $d023    ; Background color 2
VIC_BG_COL3     = $d024    ; Background color 3
VIC_SPR_MC0     = $d025    ; Sprite multicolor 0
VIC_SPR_MC1     = $d026    ; Sprite multicolor 1

; === SPRITE COLORS ===
VIC_SPR0_COLOR  = $d027
VIC_SPR1_COLOR  = $d028
VIC_SPR2_COLOR  = $d029
VIC_SPR3_COLOR  = $d02a
VIC_SPR4_COLOR  = $d02b
VIC_SPR5_COLOR  = $d02c
VIC_SPR6_COLOR  = $d02d
VIC_SPR7_COLOR  = $d02e

; === CONTROL REGISTER 1 BITS ===
VIC_CR1_RST8    = $80      ; Raster bit 8
VIC_CR1_ECM     = $40      ; Extended color mode
VIC_CR1_BMM     = $20      ; Bitmap mode
VIC_CR1_DEN     = $10      ; Display enable
VIC_CR1_RSEL    = $08      ; Row select (25/24 rows)
VIC_CR1_YSCROLL = $07      ; Y scroll mask

; === CONTROL REGISTER 2 BITS ===
VIC_CR2_MCM     = $10      ; Multicolor mode
VIC_CR2_CSEL    = $08      ; Column select (40/38 columns)
VIC_CR2_XSCROLL = $07      ; X scroll mask

; === MEMORY POINTER BITS ===
VIC_MP_VM       = $f0      ; Video matrix mask
VIC_MP_CB       = $0e      ; Character bank mask

; === IRQ BITS ===
VIC_IRQ_RST     = $01      ; Raster interrupt
VIC_IRQ_SBCOLL  = $02      ; Sprite-background collision
VIC_IRQ_SSCOLL  = $04      ; Sprite-sprite collision
VIC_IRQ_LP      = $08      ; Light pen interrupt

; === USEFUL CONSTANTS ===
RASTER_MAX      = $137     ; Maximum raster line (PAL)
RASTER_VISIBLE  = $32      ; First visible raster line
SPRITE_WIDTH    = 24       ; Sprite width in pixels
SPRITE_HEIGHT   = 21       ; Sprite height in pixels