; Commodore 64 System Definitions
; Memory locations and hardware constants

; === ZERO PAGE ===
ZP_TEMP1        = $02
ZP_TEMP2        = $03
ZP_TEMP3        = $04
ZP_PTR1         = $fb
ZP_PTR2         = $fd

; === SCREEN AND COLOR ===
SCREEN_RAM      = $0400
COLOR_RAM       = $d800
SCREEN_COLS     = 40
SCREEN_ROWS     = 25

; === KERNAL ROUTINES ===
CHROUT          = $ffd2    ; Output character
CHRIN           = $ffcf    ; Input character
GETIN           = $ffe4    ; Get character from keyboard
CLALL           = $ffe7    ; Close all files
PLOT            = $fff0    ; Set/get cursor position

; === BASIC ADDRESSES ===
BASIC_START     = $0801
BASIC_END       = $9fff

; === MEMORY CONFIGURATION ===
CPU_PORT        = $0001
MEMORY_CONFIG   = $01      ; Memory configuration register

; Configuration values for CPU_PORT
CONFIG_RAM      = $30      ; RAM everywhere
CONFIG_IO       = $35      ; I/O visible
CONFIG_KERNAL   = $37      ; KERNAL ROM visible
CONFIG_BASIC    = $3f      ; BASIC ROM visible

; === CHARACTER SET ===
CHARSET_ROM     = $d000    ; Character ROM location
CHARSET_RAM     = $2000    ; Character RAM location (when copied)

; === SPRITE DATA ===
SPRITE_DATA     = $2000    ; Default sprite data location
SPRITE_POINTERS = $07f8    ; Sprite pointers in screen RAM

; === IRQ VECTORS ===
IRQ_VECTOR      = $0314
BRK_VECTOR      = $0316
NMI_VECTOR      = $0318

; === COLORS ===
BLACK           = $00
WHITE           = $01
RED             = $02
CYAN            = $03
PURPLE          = $04
GREEN           = $05
BLUE            = $06
YELLOW          = $07
ORANGE          = $08
BROWN           = $09
LIGHT_RED       = $0a
DARK_GREY       = $0b
GREY            = $0c
LIGHT_GREEN     = $0d
LIGHT_BLUE      = $0e
LIGHT_GREY      = $0f