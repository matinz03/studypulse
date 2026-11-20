// Politecnico di Torino Master Test Bank (288 Extra Questions -> 320 Total with Base 32)
// Covers all 182 Obsidian concept notes & 18 00-Inbox active-recall files across 4 courses:
//   - Computer Architectures (42 curated + 30 generated = 72 extra -> 80 total)
//   - Data Science & DB Tech (42 curated + 30 generated = 72 extra -> 80 total)
//   - Cloud Computing Technologies (42 curated + 30 generated = 72 extra -> 80 total)
//   - Internet Architecture (42 curated + 30 generated = 72 extra -> 80 total)

function pickShuffledOptions(correct, distractors, seed) {
  const unique = [];
  for (const d of distractors) {
    const s = String(d);
    if (s !== String(correct) && !unique.includes(s)) unique.push(s);
  }
  const pool = [String(correct), ...unique.slice(0, 3)];
  while (pool.length < 4) pool.push(`Option ${pool.length + 1}`);
  // Deterministic Fisher-Yates shuffle based on seed
  const arr = [...pool];
  let x = (seed * 9301 + 49297) % 233280;
  for (let i = arr.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = x % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return {
    options: arr,
    correctIndex: arr.indexOf(String(correct)),
  };
}

// ============================================================================
// PART A: CURATED CONCEPT & CODE-TRACE QUESTIONS (42 PER COURSE = 168 TOTAL)
// ============================================================================

const COMP_ARCH_CURATED = [
  {
    key: 'ca_09',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Registers & Status',
    category: 'theory',
    difficulty: 'core',
    front: 'In ARM Cortex-M3 (ARMv7-M), what is the distinct role of R13, R14, and R15?',
    back: 'R13 is SP (Main or Process Stack Pointer), R14 is LR (Link Register holding subroutine return address or EXC_RETURN), and R15 is PC (Program Counter).',
    options: [
      'R13 = Link Register, R14 = Program Counter, R15 = Stack Pointer',
      'R13 = Stack Pointer (SP), R14 = Link Register (LR), R15 = Program Counter (PC)',
      'R13 = Frame Pointer, R14 = Status Register, R15 = Return Value',
      'R13–R15 are general-purpose scratchpad floating-point registers',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_10',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM AAPCS Calling Convention',
    category: 'theory',
    difficulty: 'exam',
    front: 'Under AAPCS (ARM Architecture Procedure Call Standard), which registers are caller-saved vs callee-saved?',
    back: 'R0–R3 pass up to four 32-bit arguments (R0/R1 return 32/64-bit results) and R0–R3, R12 are caller-saved scratch registers; R4–R11 are callee-saved and must be preserved across subroutine calls.',
    options: [
      'R0–R3 and R12 are caller-saved; R4–R11 are callee-saved',
      'R0–R7 are callee-saved; R8–R12 pass arguments',
      'Only LR and PC can be modified by a callee without saving',
      'All registers R0–R12 are automatically preserved by hardware on BL',
    ],
    correctIndex: 0,
  },
  {
    key: 'ca_11',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Full Descending Stack',
    category: 'trace',
    difficulty: 'exam',
    front: 'Cortex-M3 uses a Full Descending stack. Right after `PUSH {R0, R1, R2}` executes (with SP initially 0x20001000), what is the new SP and where is R2 located?',
    back: 'Full Descending pushes lowest-numbered register to the lowest memory address: SP decreases by 12 to 0x20000FF4 pointing to R0, [SP+4] holds R1, and [SP+8] (0x20000FFC) holds R2.',
    options: [
      'SP = 0x2000100C and R2 is at [SP-4]',
      'SP = 0x20000FF4, SP points to R0, and R2 is at [SP+8] (0x20000FFC)',
      'SP = 0x20000FF4, SP points to R2, and R0 is at [SP+8]',
      'SP = 0x20000FF0 because an extra guard word is pushed automatically',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_12',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Nested Subroutines',
    category: 'trace',
    difficulty: 'exam',
    front: 'Function `main` calls `sub1` with `BL sub1`, and `sub1` calls `sub2` with `BL sub2`. What is standard prologue/epilogue inside `sub1`?',
    back: '`sub1` must push LR on entry (`PUSH {R4, LR}`) so the inner `BL sub2` does not lose `main`’s return address, and can return directly with `POP {R4, PC}`.',
    options: [
      'Only `BX LR` at the end of sub1 without touching the stack',
      '`PUSH {R4, LR}` at entry and `POP {R4, PC}` at return',
      'Copy LR into R0 and let sub2 jump back to main directly',
      'Disable interrupts during BL so LR is frozen',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_13',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM LDM/STM Addressing Modes',
    category: 'theory',
    difficulty: 'exam',
    front: 'For ARM block transfers (`LDM`/`STM`), which mode matches stack `PUSH` and which matches stack `POP` on a Full Descending stack?',
    back: 'A Full Descending stack decrements SP before storing (`STMDB sp!, ...`, alias `PUSH`) and increments SP after loading (`LDMIA sp!, ...`, alias `POP`).',
    options: [
      'PUSH = STMIA sp!, POP = LDMDB sp!',
      'PUSH = STMDB sp!, POP = LDMIA sp!',
      'PUSH = STMIB sp!, POP = LDMDA sp!',
      'PUSH = STMDA sp!, POP = LDMIB sp!',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_14',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Pre- vs Post-Indexed Memory Access',
    category: 'trace',
    difficulty: 'exam',
    front: 'Given `R1 = 0x20000100`, contrast `LDR R0, [R1, #4]!` with `LDR R0, [R1], #4`:',
    back: 'Pre-indexed with writeback (`!`) adds #4 BEFORE loading (reads 0x20000104, R1 becomes 0x20000104). Post-indexed reads [R1] FIRST (0x20000100), THEN updates R1 to 0x20000104.',
    options: [
      'Both read 0x20000100 and leave R1 unchanged',
      'Pre-indexed `!` reads 0x20000104; post-indexed reads 0x20000100, and both end with R1 = 0x20000104',
      'Pre-indexed `!` never updates R1; post-indexed decrements R1',
      'Post-indexed reads 0x20000104 and leaves R1 at 0x20000100',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_15',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Constant Encoding & Literal Pools',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why does writing `LDR R0, =0x12345678` in ARM assembly often place data in a Literal Pool (`LTORG`) instead of a single 32-bit `MOV`?',
    back: '32-bit ARM/Thumb-2 instructions cannot encode arbitrary 32-bit immediates inside a single instruction immediate field; the assembler places constants in a nearby PC-relative literal pool (`LTORG`) or emits `MOVW`/`MOVT`.',
    options: [
      'Because Cortex-M3 has no immediate field in ALU instructions',
      'Arbitrary 32-bit constants exceed instruction immediate encoding width, so the assembler emits PC-relative loads from a literal pool',
      'Because `LDR Rd, =val` triggers an SVC interrupt at runtime',
      'Literal pools live only inside CPU R0–R3 registers',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_16',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM ALU Flags & Conditionals',
    category: 'theory',
    difficulty: 'core',
    front: 'In ARMv7-M assembly, what is the difference between `ADD R0, R1, R2` and `ADDS R0, R1, R2`?',
    back: 'Only instructions with the `S` suffix (or compare instructions `CMP`, `CMN`, `TST`, `TEQ`) update the `APSR` condition flags (N, Z, C, V). Plain `ADD` leaves flags untouched.',
    options: [
      '`ADDS` performs signed division while `ADD` performs unsigned addition',
      '`ADDS` updates APSR flags (N, Z, C, V); plain `ADD` leaves flags unchanged',
      '`ADDS` pushes the result onto the stack automatically',
      '`ADD` is 64-bit while `ADDS` is 16-bit',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_17',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Signed vs Unsigned Branches',
    category: 'trace',
    difficulty: 'exam',
    front: 'After `MOV R0, #-1; MOV R1, #5; CMP R0, R1`, which conditional branch WILL be taken?',
    back: 'As signed two’s complement integers, -1 < 5 (`BLT` is taken, `BGT` is not). As unsigned 32-bit integers, 0xFFFFFFFF > 5 (`BHI` IS taken, `BLO` is not). Confusing `BGT` vs `BHI` is a classic bug.',
    options: [
      '`BGT` (signed greater) and `BLO` (unsigned lower)',
      '`BLT` (signed less than) and `BHI` (unsigned higher)',
      '`BEQ` because both set Z=1',
      'Neither `BLT` nor `BHI` is taken',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_18',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Thumb-2 IT Block & CBZ',
    category: 'theory',
    difficulty: 'core',
    front: 'In Cortex-M3 Thumb-2, what is the purpose of an `IT` (If-Then) instruction block?',
    back: 'Thumb 16-bit/32-bit encoding lacks the 4-bit condition field on every opcode, so `IT` (up to 4 following instructions, e.g. `ITTE EQ`) supplies conditional execution predicates.',
    options: [
      'It enables hardware floating-point interrupts',
      'It supplies conditional execution predicates for up to 4 subsequent instructions without branching',
      'It invalidates the L1 instruction cache',
      'It switches between ARM 32-bit mode and RISC-V mode',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_19',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Exception Modes & Stack Pointers',
    category: 'theory',
    difficulty: 'exam',
    front: 'In ARM Cortex-M3, when does the core run in Handler mode and which stack pointer does Handler mode ALWAYS use?',
    back: 'Thread mode runs normal code (using MSP or PSP via CONTROL[1]); Handler mode runs exceptions/interrupts (always Privileged) and ALWAYS uses MSP (Main Stack Pointer).',
    options: [
      'Handler mode runs normal app threads and always uses PSP',
      'Handler mode runs exception ISRs (always privileged) and always uses MSP',
      'Thread mode is always privileged and never uses PSP',
      'Handler mode uses LR as its stack pointer',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_20',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM 8-Word Exception Stack Frame',
    category: 'trace',
    difficulty: 'exam',
    front: 'On Cortex-M3 exception entry, hardware automatically pushes an 8-word frame onto the active stack. Where is the interrupted `PC` stored relative to the new `SP`?',
    back: 'Hardware pushes `xPSR` (SP+28), `PC` (SP+24), `LR` (SP+20), `R12` (SP+16), `R3` (SP+12), `R2` (SP+8), `R1` (SP+4), `R0` (SP+0). Thus `PC` is always at `[SP, #24]`.',
    options: [
      'At `[SP, #0]`',
      'At `[SP, #24]`',
      'At `[SP, #12]`',
      'Inside R14 (LR)',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_21',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM EXC_RETURN & SVC',
    category: 'trace',
    difficulty: 'exam',
    front: 'Upon entering an ISR, Cortex-M3 sets `LR` to `EXC_RETURN` (e.g. `0xFFFFFFFD`). What happens when the ISR finishes with `BX LR`, and how does an `SVC` handler read its immediate number?',
    back: 'Branching to `EXC_RETURN` triggers hardware unstacking (0xFFFFFFF1 -> Handler/MSP, 0xFFFFFFF9 -> Thread/MSP, 0xFFFFFFFD -> Thread/PSP). An `SVC` handler reads saved `PC` at `[frame, #24]` and reads byte `[saved_PC - 2]` for the SVC immediate.',
    options: [
      '`EXC_RETURN` jumps to Flash address 0xFFFFFFFD; SVC immediate is passed in R12',
      '`BX LR` with `0xFFFFFFFD` unstacks the 8-word frame returning to Thread mode using PSP; SVC reads `[stacked_PC - 2]`',
      '`SVC` always triggers an unrecoverable HardFault',
      '`EXC_RETURN` clears IPSR and zeroes all SRAM',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_22',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Faults & SysTick',
    category: 'theory',
    difficulty: 'exam',
    front: 'Which three configurable fault exceptions escalate into `HardFault` if disabled, and how does `SysTick` operate?',
    back: '`MemManage`, `BusFault`, and `UsageFault` (e.g. undefined instruction / div-by-zero / unaligned access) escalate to `HardFault` when disabled. `SysTick` is a 24-bit count-down timer inside the NVIC/SCB that reloads from `LOAD` upon hitting 0.',
    options: [
      'NMI, Reset, and SVCall escalate to HardFault; SysTick is a 16-bit up-counter',
      'MemManage, BusFault, and UsageFault escalate to HardFault; SysTick is a 24-bit down-counter',
      'Only DMA interrupts trigger HardFault; SysTick runs only in Deep Sleep',
      'HardFault can be masked with PRIMASK',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_23',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Toolchain & Scatter File',
    category: 'theory',
    difficulty: 'exam',
    front: 'In the Keil/ARM toolchain (`armclang`/`armasm` -> `armlink` -> `fromelf`), why do RW-data and ZI-data have distinct Load vs Execution addresses in Flash/RAM?',
    back: 'Writable `RW-data` initial values live in non-volatile Flash (Load Region) and `__main` / `__rt_entry` copies RW-data to SRAM and zeroes `ZI-bss` (Execution Region) before calling `main()`.',
    options: [
      'Flash memory is faster to write at runtime than SRAM',
      'Non-volatile Flash holds initial RW-data bytes (Load view); startup `__main` copies RW-data to RAM and zeroes ZI before `main()` (Execution view)',
      '`armlink` deletes all RW-data to shrink the `.axf` ELF image',
      '`fromelf` executes the binary directly on the development PC',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_24',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Directives & Memory Alignment',
    category: 'theory',
    difficulty: 'core',
    front: 'What do the ARM assembly directives `DCD`, `DCB`, `SPACE`, and `ALIGN` emit?',
    back: '`DCD` emits 32-bit words, `DCB` emits bytes/ASCII strings, `SPACE n` reserves `n` zeroed bytes, and `ALIGN` pads the location counter (often needed after odd `DCB` strings before word `DCD` or code).',
    options: [
      '`DCD` = double precision FP; `DCB` = debug breakpoint',
      '`DCD` = 32-bit word data; `DCB` = byte data; `SPACE` = zero-reserved bytes; `ALIGN` = boundary padding',
      '`SPACE` frees heap memory at runtime; `ALIGN` flushes cache',
      'They are linker commands only allowed in `.sct` scatter files',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_25',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'RISC-V Architecture Fundamentals',
    category: 'theory',
    difficulty: 'core',
    front: 'In RV32I RISC-V, what are the architectural properties of register `x0` (`zero`) and `x1` (`ra`)?',
    back: '`x0` is hardwired to constant 0 (writes are discarded), and `x1` (`ra`) holds the return address stored by `jal rd, label` / `jalr`.',
    options: [
      '`x0` is the stack pointer and `x1` is the program counter',
      '`x0` always reads as 0 (writes ignored) and `x1` (`ra`) is the return address register',
      'Both `x0` and `x1` are caller-free floating-point registers',
      '`x0` increments automatically after every `lw` instruction',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_26',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'RISC-V Addressing & Immediates',
    category: 'trace',
    difficulty: 'exam',
    front: 'How do you load a full 32-bit constant `0x12345678` into `x5` using standard RV32I instructions without pseudo-instruction magic?',
    back: '`LUI x5, 0x12345` places the upper 20 bits into bits [31:12], and `ADDI x5, x5, 0x678` adds the sign-extended 12-bit lower immediate (adjusting upper +1 if bit 11 is 1).',
    options: [
      'A single `ADDI x5, x0, 0x12345678` instruction',
      '`LUI` for upper 20 bits followed by `ADDI` for the lower 12 bits',
      '`SW x5, 0x12345678(x0)`',
      'Two consecutive `JAL` instructions',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_27',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Pipeline Structural & Data Hazards',
    category: 'theory',
    difficulty: 'core',
    front: 'In a classic 5-stage RISC pipeline (`IF, ID, EX, MEM, WB`), why is a separate Instruction Memory and Data Memory (Harvard L1 caches) used?',
    back: 'Without separate L1 I-cache and D-cache (or dual ports), an `IF` instruction fetch and a `MEM` `lw/sw` access occurring in the same clock cycle cause a structural hazard.',
    options: [
      'To increase WAW hazards between loads and adds',
      'To eliminate the structural hazard when `IF` fetches an instruction in the same cycle `MEM` accesses data',
      'To avoid using registers x1–x31',
      'Because branches resolve only in the WB stage',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_28',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Load-Use Hazard & Forwarding',
    category: 'trace',
    difficulty: 'exam',
    front: 'With full EX->EX and MEM->EX bypassing, can forwarding eliminate ALL stalls in `LW R1, 0(R2); ADD R3, R1, R4`?',
    back: 'No! The loaded data from `LW` is only ready at the END of the `MEM` stage, whereas `ADD` needs `R1` at the START of its `EX` stage — requiring at least 1 hardware interlock stall cycle (`ID` hazard detection) unless compiler schedules an independent instruction between them.',
    options: [
      'Yes, zero stalls with EX->EX forwarding alone',
      'No: `LW` delivers data after MEM, so `ADD` needs 1 load-use stall bubble even with forwarding',
      'It requires 5 stalls because register write is blocking',
      'Load-use hazards only happen on stores',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_29',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'MIPS R4000 8-Stage Superpipeline',
    category: 'theory',
    difficulty: 'exam',
    front: 'In the MIPS R4000 8-stage pipeline (`IF, IS, RF, EX, DF, DS, TC, WB`), what are the base load-use delay and taken branch delay?',
    back: 'Data cache access takes 2 stages (`DF`, `DS`) and tag check (`TC`), producing a 2-cycle load delay slot after loads; target/condition resolution creates a 3-cycle branch delay (1 software delay slot + 2 hardware stall cycles if taken).',
    options: [
      '0-cycle load delay and 0-cycle branch delay',
      '2-cycle load delay and 3-cycle taken branch delay',
      '8-cycle load delay and 1-cycle branch delay',
      'Branch delay only occurs for register-indirect jumps',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_30',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Multicycle Operations & ID Issue Stalls',
    category: 'theory',
    difficulty: 'exam',
    front: 'When issuing an instruction in an in-order scoreboard/multicycle pipeline (Lecture 05), which three checks happen in the ID stage before execution proceeds?',
    back: 'ID checks (1) Structural hazard (target functional unit busy AND potential WB port conflict on the same future cycle), (2) RAW data hazard on active producers, and (3) WAW output hazard if an in-flight older instruction writes the same destination register.',
    options: [
      'Only TLB miss and L2 cache hit rate',
      'Structural hazard (unit / WB port), RAW data hazard, and WAW output hazard',
      'Page fault, IRQ priority, and Ethernet CRC',
      'WAR hazard only, because WAR cannot happen in-order',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_31',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Branch Prediction & BHT vs BTB',
    category: 'theory',
    difficulty: 'exam',
    front: 'What distinguishes a 2-bit Saturating Counter (BHT) from a Branch Target Buffer (BTB) and a Tournament Predictor?',
    back: 'A 2-bit BHT requires two consecutive mispredictions to flip direction bias (helping nested loop exits); a BTB caches predicted target PCs in IF stage (eliminating taken-branch bubbles); a Tournament Predictor dynamically selects between local and global correlating predictors.',
    options: [
      'A BHT stores target addresses in WB; a BTB only counts misses',
      '2-bit BHT predicts Taken/Not-Taken with hysteresis; BTB caches target PC in IF; Tournament chooses per branch between global and local predictors',
      'A 1-bit predictor handles nested loops better than a 2-bit predictor',
      'BTBs are only needed when branches are always not-taken',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_32',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Tomasulo Common Data Bus (CDB)',
    category: 'theory',
    difficulty: 'exam',
    front: 'In Tomasulo’s algorithm (Lecture 10), how do Reservation Stations and the Common Data Bus (CDB) implement Register Renaming dynamically?',
    back: 'At Issue, missing source operands record the Reservation Station tag of the producer in `Qj/Qk` and the Register File `Qi` points to the producing RS tag; when a result finishes, the CDB broadcasts `(tag, value)` to all waiting RS slots, registers, and store buffers simultaneously.',
    options: [
      'Wait until WB finishes in-order before issuing any downstream instruction',
      'Register File `Qi` & RS `Qj/Qk` tags rename registers dynamically; CDB broadcasts `(tag, value)` directly to all waiting consumers',
      'CDB reads all DRAM banks before broadcasting',
      'Tomasulo forbids out-of-order execution of loads',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_33',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Tomasulo vs ROB Speculation',
    category: 'theory',
    difficulty: 'exam',
    front: 'Without a Reorder Buffer (ROB), why is pure Tomasulo’s algorithm unable to recover cleanly from branch mispredictions or page faults?',
    back: 'In pure Tomasulo without an ROB, CDB broadcasts immediately overwrite the architectural Register File out of order, losing the clean pre-exception/pre-branch snapshot.',
    options: [
      'Pure Tomasulo cannot detect RAW hazards',
      'Pure Tomasulo writes the architectural Register File out-of-order on CDB broadcast; ROB holds speculative results until in-order Commit',
      'CDB has no address lines for 32-bit tags',
      'Tomasulo only executes integer instructions',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_34',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Memory Disambiguation in Dynamic Scheduling',
    category: 'theory',
    difficulty: 'exam',
    front: 'In an out-of-order CPU with a Load/Store Queue, when can a younger `LOAD` safely execute ahead of an older `STORE`?',
    back: 'Loads may bypass older stores once all older stores’ effective addresses are resolved and none aliases the load address (or speculatively with store-to-load forwarding & replay on detected alias conflict).',
    options: [
      'Loads can never bypass older stores under any hardware design',
      'When older store addresses are known non-conflicting (or speculatively with store-queue alias detection + replay)',
      'Only when cache is Write-Through No-Allocate',
      'Whenever PC is divisible by 8',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_35',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Loop Unrolling & Register Renaming',
    category: 'trace',
    difficulty: 'exam',
    front: 'Suppose a loop computes `F[i] = F[i] + c` unrolled 4×, using the SAME register `F0` for all 4 loads vs renaming to `F0, F6, F12, F18`. What changes?',
    back: 'Reusing `F0` across unrolled iterations creates artificial WAR/WAW name dependencies that prevent parallel/pipelined issue; assigning distinct registers unlocks scheduling freedom.',
    options: [
      'Reusing F0 runs 4× faster due to cache locality',
      'Assigning distinct registers removes WAR/WAW stalls across unrolled iterations so ALU/memory latencies overlap',
      'Loop unrolling shrinks binary code size without removing branch overhead',
      'Distinct registers create new RAW loop-carried dependencies',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_36',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Cache Policies: Write-Back vs Write-Through',
    category: 'theory',
    difficulty: 'core',
    front: 'What is the role of the Dirty Bit in a Write-Back, Write-Allocate cache?',
    back: 'Writes only update the cache block and mark Dirty=1 without immediately writing lower-level memory; lower memory is updated only when a dirty line is evicted/replaced.',
    options: [
      'To mark lines corrupted by alpha particles',
      'To track modified cache blocks that must be written back to L2/DRAM upon eviction',
      'To force every write hit straight to DRAM',
      'To identify instructions vs data in unified L2',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_37',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Three Cs of Cache Misses',
    category: 'theory',
    difficulty: 'exam',
    front: 'Increasing cache set associativity (e.g., Direct-Mapped -> 4-way Set Associative at fixed capacity) directly reduces which type of cache miss?',
    back: 'Conflict (collision) misses drop sharply as associativity rises, whereas Compulsory (cold-start) misses depend on block size/prefetching and Capacity misses depend on total cache size.',
    options: [
      'Compulsory (cold) misses only',
      'Conflict misses',
      'DRAM refresh misses',
      'TLB shootdown misses exclusively',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_38',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Superscalar vs VLIW vs SIMD',
    category: 'theory',
    difficulty: 'exam',
    front: 'Contrast an Out-of-Order Superscalar core with a VLIW processor and SIMD instructions:',
    back: 'Superscalar discovers independent ops at runtime in hardware; VLIW relies on the compiler to bundle independent ops into fixed wide packets; SIMD applies one instruction across multiple packed vector lanes simultaneously (Data-Level Parallelism).',
    options: [
      'VLIW dynamically schedules at runtime; Superscalar uses static compiler-only bundles',
      'Superscalar schedules multiple ops dynamically in hardware; VLIW packs static compiler-scheduled bundles; SIMD executes one op on vector data lanes',
      'SIMD replaces ROB with shadow page tables',
      'All three are identical in hardware complexity',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_39',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'CPI Performance Equation',
    category: 'theory',
    difficulty: 'core',
    front: 'In the Iron Law of Processor Performance (`CPU Time = IC * CPI * Clock Period`), how do ISA design, pipeline stalls, and clock rate interact?',
    back: 'Reducing clock period (raising frequency) often deepens the pipeline, raising hazard/branch CPI penalties; optimizing only one factor while ignoring IC or CPI can slow total execution time.',
    options: [
      'Clock frequency alone uniquely determines program runtime',
      'Execution time depends on the product of Instruction Count (IC), Cycles Per Instruction (CPI), and Clock Cycle Time',
      'Increasing CPI always speeds up memory-bound loops',
      'Instruction Count depends only on DRAM capacity',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_40',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'AMAT (Average Memory Access Time)',
    category: 'numeric',
    difficulty: 'exam',
    front: 'An L1 cache has a 1-cycle Hit Time, 5% Miss Rate, and an L2 Miss Penalty of 40 cycles. What is the Average Memory Access Time (AMAT)?',
    back: 'AMAT = Hit Time + Miss Rate * Miss Penalty = 1 + 0.05 * 40 = 1 + 2 = 3.0 cycles.',
    options: ['1.05 cycles', '3.0 cycles', '2.05 cycles', '41.0 cycles'],
    correctIndex: 1,
  },
  {
    key: 'ca_41',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Hardware Speculation Recovery',
    category: 'trace',
    difficulty: 'exam',
    front: 'When a predicted conditional branch at ROB entry #4 resolves as Mispredicted, which speculative instructions are flushed?',
    back: 'Every instruction younger than ROB #4 (after the branch in program order) is squashed from the ROB, Reservation Stations, and Load/Store Queue, and fetch restarts at the corrected target PC while ROB #1..#4 remain valid.',
    options: [
      'Only ROB #1..#3 are flushed',
      'All younger entries after the mispredicted branch (#5 onward) are squashed while older entries commit normally',
      'The entire instruction cache is erased',
      'Mispredictions only take effect after program exit',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_42',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ARM Static Data Initialization',
    category: 'trace',
    difficulty: 'exam',
    front: 'In an ARM C firmware build, where do `const uint32_t LUT[4]`, `int counter = 7;`, and `uint8_t buf[512];` (uninitialized) end up?',
    back: '`const` arrays reside in `RO-data` (Flash only); initialized non-zero globals go in `RW-data` (Load in Flash, copied to RAM); uninitialized/zero globals go in `ZI-bss` (zeroed in RAM at startup, taking 0 bytes of Flash image payload!).',
    options: [
      'All three stay solely inside RAM without Flash storage',
      '`const` -> RO-data (Flash), `counter = 7` -> RW-data (Flash -> RAM), `buf[512]` -> ZI (RAM zeroed at startup, no Flash body)',
      '`buf[512]` consumes 512 bytes of Flash `.bin` literals',
      '`const` arrays are copied into R4–R11 before `Reset_Handler`',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_43',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Cortex-M3 Vector Table Boot Sequence',
    category: 'trace',
    difficulty: 'exam',
    front: 'Right out of hardware Reset on ARM Cortex-M3, what are the VERY FIRST two 32-bit words fetched from the vector table at `0x00000000`?',
    back: 'Word 0 (`0x00000000`) initializes `MSP` (Initial Main Stack Pointer), and Word 1 (`0x00000004`) holds the Reset Vector address (LSB=1 for Thumb state) loaded into `PC`.',
    options: [
      'Word 0 = `main()` address, Word 1 = Flash size',
      'Word 0 = Initial `MSP` value, Word 1 = `Reset_Handler` address (bit 0 = 1 for Thumb)',
      'Word 0 = SysTick reload, Word 1 = NMI flag',
      'Hardware jumps directly to `0x20000000` in ARM 32-bit mode',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_44',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Write Buffers & Store Hazards',
    category: 'theory',
    difficulty: 'core',
    front: 'Why can a Store Buffer hide Write-Through latency, and what risk does it introduce for subsequent Loads?',
    back: 'A FIFO Write Buffer absorbs store hits/misses so the core doesn’t stall on slow L2/DRAM; however, a subsequent Load must snoop the Store Buffer (or stall) so it does not read stale memory ahead of a pending write.',
    options: [
      'Store buffers execute branches speculatively',
      'Store buffers let CPU continue immediately, so later Loads must check/bypass buffered stores to avoid stale reads',
      'Write buffers automatically increase cache associativity',
      'They eliminate compulsory misses',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_45',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Register File Read/Write Timing',
    category: 'theory',
    difficulty: 'core',
    front: 'How do standard 5-stage pipelines avoid a structural hazard when `WB` writes to the Register File in the same cycle `ID` reads from it?',
    back: 'By using split-phase half-cycle register access: `WB` writes on the falling clock edge (first half-cycle) and `ID` reads on the rising edge / second half-cycle (also delivering same-cycle write-to-read forwarding!).',
    options: [
      'By forbidding ID whenever any instruction is in WB',
      'Writing in the first half-cycle and reading in the second half-cycle (internal register-file bypass)',
      'Duplicating the ISA into two separate CPUs',
      'Halving the clock frequency dynamically',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_46',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Control Dependence & If-Conversion',
    category: 'theory',
    difficulty: 'exam',
    front: 'When is predication / conditional move (`CMOV` or Thumb-2 `IT`) preferred over a conditional branch instruction?',
    back: 'For short 1–2 instruction `if-else` diamonds with unpredictable 50/50 branch outcomes, predication converts a control dependence into a data flow operation, eliminating expensive branch misprediction pipeline flushes.',
    options: [
      'When loops execute 1,000,000 iterations cleanly predicted',
      'For short unpredictable `if-else` blocks where misprediction flush penalties exceed executing both tiny arms',
      'Whenever recursive function calls exceed stack depth',
      'Only when floating-point division overflows',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_47',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Instruction Issue Width & Bottlenecks',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why can a 4-issue Superscalar core still achieve IPC ~1.4 instead of 4.0 on general integer code?',
    back: 'Integer code exhibits frequent true RAW dependencies, tight basic blocks (branches every 4–6 instructions), cache misses, and control-flow uncertainty limiting available Instruction-Level Parallelism.',
    options: [
      'Because 4-issue cores turn off 3 decoders on integer code',
      'Limited ILP due to short basic blocks, unpredictable branches, true RAW chains, and memory stalls',
      'Because RISC-V limits registers to 8 words',
      'Amdahl’s Law limits IPC below 2.0 on every CPU',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_48',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'RISC-V Leaf vs Non-Leaf Prologue',
    category: 'trace',
    difficulty: 'exam',
    front: 'In RV32I, why should a function push `s0–s1` (`x8–x9`) before using them, whereas `t0–t2` (`x5–x7`) need not be pushed at entry?',
    back: '`s0–s11` are callee-saved: the caller assumes they survive a `jal`. `t0–t6` and `a0–a7` are caller-saved temporaries that the callee may overwrite freely.',
    options: [
      '`s0–s1` are read-only constants',
      '`s0–s1` are callee-saved (must be restored on return); `t0–t2` are caller-saved temporaries',
      '`t0–t2` are saved automatically in hardware shadow registers',
      'RISC-V has no stack pointer',
    ],
    correctIndex: 1,
  },
  {
    key: 'ca_49',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'ASE Studio Weighted Performance',
    category: 'numeric',
    difficulty: 'lab',
    front: 'In ASE Studio (Lab 01) at 1750 Hz, Program A takes 350 cycles (weight 0.40) and Program B takes 700 cycles (weight 0.60). What is weighted execution time?',
    back: 'T_A = 350 / 1750 = 0.20 s; T_B = 700 / 1750 = 0.40 s. Weighted sum = 0.40*(0.20) + 0.60*(0.40) = 0.08 + 0.24 = 0.32 s.',
    options: ['0.32 s', '0.60 s', '0.20 s', '0.16 s'],
    correctIndex: 0,
  },
  {
    key: 'ca_50',
    courseKey: 'comp_arch',
    subjectName: 'Computer Architectures',
    conceptTitle: 'Compiler Optimization vs Linker GC',
    category: 'theory',
    difficulty: 'exam',
    front: 'In `00 Inbox ARM Toolchain`, distinguish compiler optimization (`-O2`) from linker unused-section removal (`--gc-sections` / armlink unused removal):',
    back: 'Compiler optimizations transform C/C++ IR inside functions (inlining, dead-code elimination, register allocation, which can reorder lines when stepping in a debugger), whereas the linker drops entire unreferenced code/data sections (`__unused`) across object files.',
    options: [
      'Linker `-O2` rewrites register allocation across SRAM at runtime',
      'Compiler optimization transforms intra-function code/registers (affecting debug stepping), while linker section removal discards unreferenced object sections',
      'They are identical passes run by `fromelf`',
      'Linker optimization turns ZI-bss into RO-code',
    ],
    correctIndex: 1,
  },
];

const DATA_SCIENCE_CURATED = [
  {
    key: 'ds_09',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Big Data & Five Vs',
    category: 'theory',
    difficulty: 'core',
    front: 'In the Big Data 5 Vs framework (Volume, Velocity, Variety, Veracity, Value), what does Veracity specifically address?',
    back: 'Veracity captures data trustworthiness, noise, biases, missing values, inconsistencies, and provenance uncertainty in raw high-volume streams.',
    options: [
      'Speed of real-time Kafka event ingestion',
      'Data quality, noise, uncertainty, and trustworthiness',
      'Mixing structured SQL with unstructured video blobs',
      'Petabyte disk array compression ratios',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_10',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Descriptive, Predictive & Prescriptive Analytics',
    category: 'theory',
    difficulty: 'core',
    front: 'Contrast Predictive Analytics with Prescriptive Analytics:',
    back: 'Descriptive summarizes what happened (BI dashboards); Predictive forecasts what is likely to happen (classification/regression); Prescriptive recommends optimal decisions/actions via optimization or simulation.',
    options: [
      'Descriptive optimizes future actions; Prescriptive builds ETL pipelines',
      'Predictive forecasts unknown/future outcomes; Prescriptive recommends optimal actions under constraints',
      'Both only produce historical SQL `GROUP BY` reports',
      'Prescriptive runs exclusively before data cleaning',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_11',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'KDD Process Stages',
    category: 'theory',
    difficulty: 'core',
    front: 'What is the proper sequential flow of Knowledge Discovery in Databases (KDD)?',
    back: 'Selection -> Preprocessing (cleaning) -> Transformation (feature selection/reduction) -> Data Mining (model/pattern discovery) -> Interpretation/Evaluation.',
    options: [
      'Data Mining -> Selection -> Preprocessing -> SQL Ingestion',
      'Selection -> Preprocessing -> Transformation -> Data Mining -> Evaluation',
      'Dashboarding -> Cleaning -> Prediction -> Hardware Speculation',
      'Apriori -> Normalization -> ETL -> Outlier Injection',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_12',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Data Types & Attribute Scales',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why can you compute ratios like "twice as heavy" on Ratio scales (Weight in kg) but NOT on Interval scales (Temperature in °C)?',
    back: 'Ratio scales have a meaningful absolute zero (0 kg = absence of weight, 20 kg is 2× 10 kg); Interval scales have an arbitrary zero point (20 °C is not "twice as hot" as 10 °C), though differences are meaningful.',
    options: [
      'Because Interval scales are strictly categorical/nominal',
      'Ratio scales possess a true non-arbitrary zero, whereas Interval scales have an arbitrary zero so only differences are meaningful',
      'Because Ordinal scales allow multiplication',
      'Because °C cannot compute means or medians',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_13',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Min-Max vs Z-Score Normalization',
    category: 'theory',
    difficulty: 'exam',
    front: 'When extreme outliers are present in an income column, how do Min-Max `[0, 1]` scaling and Z-score standardization behave?',
    back: 'A single huge outlier compresses all normal values into a tiny sliver near 0 under Min-Max `(x - min)/(max - min)`. Z-score `(x - mean)/std` preserves relative spread around 0 (though robust median/IQR is even safer).',
    options: [
      'Min-Max is completely unaffected by extreme outliers',
      'Min-Max squeezes normal values into a narrow sub-range near 0 due to max/min stretch; Z-score centers around mean/std',
      'Z-score forces every value strictly inside `[0, 1]`',
      'Both algorithms discard rows containing outliers automatically',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_14',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Cosine vs Euclidean vs Jaccard',
    category: 'theory',
    difficulty: 'exam',
    front: 'For high-dimensional sparse TF-IDF document vectors of varying lengths, which similarity measure is standard and why?',
    back: 'Cosine Similarity compares the angle between vectors (`(x·y)/(||x|| ||y||)`), ignoring document length/magnitude differences and shared zeros.',
    options: [
      'Euclidean distance because shared zero counts dominate positively',
      'Cosine Similarity because it measures directional angle normalized by magnitude, invariant to document length',
      'Simple Matching Coefficient (SMC) because joint word absences prove topic equality',
      'Pearson correlation cannot handle positive frequencies',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_15',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Two vs Three-Level Data Warehouse',
    category: 'theory',
    difficulty: 'exam',
    front: 'What additional layer sits in a 3-Level Data Warehouse architecture compared to a 2-Level architecture?',
    back: 'A 3-Level architecture inserts a Reconciled Data Layer (ODS / integrated normalized store) between operational sources + ETL and the multidimensional Data Marts/DW, offering one canonical cleaned enterprise truth.',
    options: [
      'An OLTP cash register inside each browser tab',
      'A Reconciled Data Layer serving as a clean unified source for independent Data Marts',
      'Replacing Data Marts with raw unstructured MP4 blobs',
      'Moving OLAP Roll-Up computations to client JavaScript',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_16',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Distributive, Algebraic & Holistic Aggregates',
    category: 'theory',
    difficulty: 'exam',
    front: 'In OLAP materialized view pre-aggregation, why can `AVG` be incrementally rolled up from fine to coarse cubes, while `MEDIAN` cannot?',
    back: '`AVG` is Algebraic: derivable from bounded distributive sub-aggregates `(SUM, COUNT)`. `MEDIAN` is Holistic: no fixed-size sub-aggregates from partitions can compute the true global median without raw elements.',
    options: [
      '`AVG` is Holistic while `MEDIAN` is Distributive',
      '`AVG` is Algebraic (computable from partition `SUM` and `COUNT`); `MEDIAN` is Holistic (requires full partition elements)',
      '`SUM` cannot roll up from month to year',
      'Wait-free MOLAP arrays store medians using binary logs',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_17',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Fact Measure Additivity',
    category: 'theory',
    difficulty: 'exam',
    front: 'Classify `AccountBalance` in a daily banking snapshot fact table across `(Customer, Branch, Day)`:',
    back: '`AccountBalance` is Semi-Additive: you can `SUM` it across customers or branches on a single day, NOT across Days (adding Monday + Tuesday balances double-counts the money — use `AVG` or end-of-period across Time).',
    options: [
      'Fully Additive across all three dimensions',
      'Semi-Additive (summable across Customer/Branch, must use AVG/last across Time)',
      'Non-Additive everywhere like Unit Margin %',
      'A Junk Dimension attribute',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_18',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Star vs Snowflake Schemas & Surrogate Keys',
    category: 'theory',
    difficulty: 'core',
    front: 'Why do Star Schema dimension tables use meaningless integer Surrogate Keys instead of operational primary keys (e.g., SKU or SSN)?',
    back: 'Surrogate keys decouple the DW from source system key reuse/reformatting, enable multi-source integration, stay compact for fact indexing, and track SCD Type 2 history cleanly.',
    options: [
      'SQL forbids VARCHAR columns in fact tables',
      'They isolate DW from source key changes, merge heterogeneous systems, and support SCD historical versions cleanly',
      'Surrogate keys eliminate dimension tables completely',
      'To turn a Star Schema into 6NF operational OLTP',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_19',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'DFM: Convergence, Shared Hierarchies & Optionality',
    category: 'theory',
    difficulty: 'exam',
    front: 'In the Dimensional Fact Model (DFM), what does a dashed optionality mark vs a shared hierarchy mean?',
    back: 'Optional attributes (empty circle/dash) may be NULL for some fact instances; a Shared Hierarchy shares sub-hierarchies across branches/dimensions (e.g., Store and Customer both converging on City -> Region -> Country).',
    options: [
      'Optional attributes must strictly be primary keys',
      'Optionality permits missing attribute links; shared hierarchies avoid duplicating common paths like City -> Country across dimensions',
      'Shared hierarchies forbid Roll-Up operations',
      'Descriptive attributes replace measures in OLAP cubes',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_20',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Degenerate & Junk Dimensions',
    category: 'theory',
    difficulty: 'exam',
    front: 'Contrast a Degenerate Dimension with a Junk Dimension in a Data Warehouse:',
    back: 'A Degenerate Dimension is a transactional ID (e.g., ReceiptNumber) kept directly inside the Fact Table because all its attributes live in other dimensions. A Junk Dimension groups unrelated low-cardinality flags/indicators into one clean dimension table.',
    options: [
      'Junk dimensions contain corrupted nulls; Degenerate dimensions store full customer biographies',
      'Degenerate Dimension keeps bare ticket/order ID in the Fact Table; Junk Dimension packs miscellaneous low-cardinality flags into one table',
      'Both must be stored in separate 3NF bridge tables',
      'Degenerate dimensions hold semi-additive prices',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_21',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Bridge Tables: Weighted Allocation vs Impact Queries',
    category: 'theory',
    difficulty: 'exam',
    front: 'In a Many-to-Many bridge table (e.g. multiple Authors writing one Book), how do Impact queries avoid double-counting compared to Weighted Allocation queries?',
    back: 'Weighted Allocation multiplies fact measures by a normalized Weight (`sum = 1`) so totals remain exact when grouped. Impact queries report the full Book sales for a single author (`WEIGHT` omitted) while warning users NOT to sum across authors.',
    options: [
      'By deleting co-authors so only the first author exists',
      'Weighted allocation splits measures via `Weight` summing to 1 so totals stay additive; Impact queries omit weights for single-member exposure without cross-member summing',
      'By storing weights inside a HOLAP text file',
      'Impact queries divide sales by total warehouse row count',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_22',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Factless Fact Tables & Coverage Sets',
    category: 'theory',
    difficulty: 'exam',
    front: 'When is a Factless Fact Table used, and how do you answer "Which promoted products did NOT sell today?" (negative analysis)?',
    back: 'Factless facts record events/coverage with no numeric measure (e.g. Student Attendance or Promo Assignment); negative analysis takes `Promoted Set MINUS Sales Set` over matching grain.',
    options: [
      'When there are no dimensions at all',
      'Events/coverages without quantitative measures (count=1 rows); negative queries take Coverage/Promo table MINUS Sales table',
      'Only when fact grain equals millisecond IoT logs',
      'By setting every Sale amount equal to -999',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_23',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'OLAP Roll-Up, Drill-Down, Slice & Dice',
    category: 'theory',
    difficulty: 'core',
    front: 'Which OLAP operation climbs UP a concept hierarchy (`Day -> Month -> Year` or `City -> Country`) to reduce granularity?',
    back: 'Roll-Up aggregates up a hierarchy (or removes a dimension); Drill-Down navigates down to finer detail; Slice fixes one dimension value; Dice defines a subcube via ranges on multiple dimensions.',
    options: ['Drill-Down', 'Roll-Up', 'Pivot / Rotate', 'Min-Max Scaling'],
    correctIndex: 1,
  },
  {
    key: 'ds_24',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Warehouse Sparsity & Aggregate Explosion',
    category: 'theory',
    difficulty: 'exam',
    front: 'With $d$ dimensions and multiple hierarchy levels per dimension, why can pre-materializing EVERY possible cuboid cause Aggregate Explosion?',
    back: 'Even if base facts fill only 1% of Cartesian cells (high sparsity), the number of group-by cuboids grows exponentially ($\\prod (L_i + 1)$), exploding disk size and ETL update time; hence selective cuboid materialization.',
    options: [
      'Because SQL SUM overflows 64 bits after 4 dimensions',
      'Exponential growth in combinations of dimension hierarchy levels fills storage & slows ETL despite sparse base cells',
      'MOLAP arrays forbid more than 2 dimensions',
      'Sparsity increases Gini impurity to 1.0',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_25',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'FP-Growth vs Apriori Advantage',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why is FP-Growth typically much faster than Apriori on dense transactional datasets with low min-support?',
    back: 'Apriori generates huge candidate itemsets and scans the database on every level $k$; FP-Growth compresses transactions into a compact FP-Tree using just 2 DB scans and mines conditional FP-Trees recursively without candidate generation.',
    options: [
      'FP-Growth ignores minimum support thresholds entirely',
      'FP-Growth compresses DB into an FP-Tree in 2 scans and discovers frequent patterns recursively without costly candidate generation/rescanning',
      'Apriori cannot find 2-itemsets',
      'FP-Growth turns association rules into linear regression',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_26',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Generalized Association Rules',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why might mining rules across a product taxonomy (Generalized Association Rules, e.g., `Outerwear` above `Jackets`) uncover valid patterns missed at leaf SKU level?',
    back: 'Individual leaf SKUs (specific jacket sizes/colors) often fall below `minsup`, whereas rolling counts up the hierarchy reaches support while avoiding trivial ancestor rules (such as `Jacket -> Outerwear` with ~100% expected lift).',
    options: [
      'Taxonomy hierarchies raise Leaf SKU cardinality above N',
      'Aggregating sparse leaf items up concept hierarchies lifts support above threshold, though redundant ancestor rules must be pruned',
      'Generalized rules do not satisfy anti-monotonicity',
      'They strictly require DBSCAN clustering first',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_27',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Decision Tree Split Criteria (Gini & Entropy)',
    category: 'theory',
    difficulty: 'core',
    front: 'In a binary classification node, at what class distribution do BOTH Gini Impurity and Shannon Entropy reach their maximum vs minimum?',
    back: 'Both hit minimum 0 when the node is 100% pure (all one class), and peak at maximum impurity (`Gini = 0.5`, `Entropy = 1.0`) when split 50% / 50%.',
    options: [
      'Max at 100%/0%, Min at 50%/50%',
      'Min = 0 at pure (100%/0%), Max at uniform 50%/50% (`Gini=0.5`, `Entropy=1.0`)',
      'Gini peaks at 1.0 and Entropy peaks at 0.25',
      'Impurity depends on attribute string length',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_28',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Decision Tree Splitting & Gain Ratio',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why does raw Information Gain unfairly favor high-cardinality ID columns (like `TransactionID`), and how does Gain Ratio (C4.5) fix it?',
    back: 'Splitting on a unique ID produces 100% pure 1-row leaves with huge Information Gain despite zero generalization! Gain Ratio divides Information Gain by Split Information (partition entropy), penalizing excessive branching.',
    options: [
      'Information Gain deletes ID columns automatically',
      'Gain Ratio divides Info Gain by SplitInfo to penalize attributes that shatter data into many tiny partitions',
      'Gini naturally explodes toward infinity on unique IDs',
      'Pre-pruning expands ID splits twice deeper',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_29',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Overfitting & Tree Pruning',
    category: 'theory',
    difficulty: 'exam',
    front: 'How do you recognize Overfitting in a Decision Tree, and contrast Pre-pruning vs Post-pruning:',
    back: 'Overfitting drops test accuracy as training accuracy approaches 100% (fitting noise). Pre-pruning stops tree growth early (risk: Horizon Effect stopping before an XOR split); Post-pruning grows a full tree and prunes subtrees upward using validation set or pessimistic error.',
    options: [
      'Both training and test accuracy reach 100%',
      'Training error falls while validation/test error rises; Pre-pruning stops early (risks Horizon Effect), Post-pruning collapses subtrees after full growth',
      'Post-pruning never uses validation data',
      'Overfitting only occurs in Naive Bayes',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_30',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Random Forests Ensembling',
    category: 'theory',
    difficulty: 'exam',
    front: 'What two sources of randomness make Random Forests decorrelate trees and cut variance better than single Decision Trees?',
    back: '(1) Bootstrap sampling (Bagging: sampling N rows with replacement per tree) and (2) Random Feature Subspaces (testing only `sqrt(d)` random features at each node split), preventing one strong feature from dominating every tree.',
    options: [
      'Sorted deterministic chunks + running K-means on labels',
      'Bootstrap row sampling (Bagging) + random subset of candidate features evaluated at each split',
      'Using linear activation functions in leaf nodes',
      'Dropping all numerical attributes',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_31',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Rule-Based Classification & Sequential Covering',
    category: 'theory',
    difficulty: 'exam',
    front: 'When extracting IF-THEN rules with Sequential Covering (`RIPPER`/FOIL), why must you resolve rule ordering or conflicts?',
    back: 'Multiple independent rules might fire for a test instance with contradictory predictions (not mutually exclusive), so ordered decision lists or class-by-class ordering + default fallback class are needed.',
    options: [
      'Because rules can never overlap unless features are normalized',
      'Unordered rules may overlap with conflicting classes or miss an instance, requiring ordered priority or a default fallback class',
      'Sequential covering deletes training data permanently from disk',
      'Because rules cannot evaluate continuous attributes',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_32',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Naive Bayes & Laplace Smoothing',
    category: 'theory',
    difficulty: 'exam',
    front: 'In Naive Bayes classification, why would multiplying zero likelihood `P(x_i | y) = 0` break prediction without Laplace smoothing?',
    back: 'Since Naive Bayes multiplies conditional probabilities across features, a single unseen `(feature_value, class)` pair zeros out the entire posterior `P(y|X)`; adding `+1` pseudocount (`(c+1)/(N+V)`) prevents zero-probability collapse.',
    options: [
      'It causes an SQL foreign key violation',
      'One zero likelihood wipes out the entire product of conditionals; Laplace smoothing adds small pseudocounts to numerator and denominator',
      'Laplace smoothing removes the conditional independence assumption',
      'It converts Naive Bayes into a 5-layer MLP',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_33',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'K-Nearest Neighbors (k-NN) Tradeoffs',
    category: 'theory',
    difficulty: 'core',
    front: 'What happens to a k-NN classifier when $k = 1$ vs when dimensionality $d$ becomes very large without feature scaling?',
    back: '$k = 1$ yields jagged noise-sensitive boundaries (overfitting); high $d$ causes the Curse of Dimensionality where distances between points converge; unscaled features with huge ranges completely dominate Euclidean distance.',
    options: [
      '$k = 1$ produces maximum bias and ignores training labels',
      '$k = 1$ overfits local noise; high $d$ suffers distance concentration; unscaled wide features dominate Euclidean distance',
      'k-NN trains an explicit hyperplane offline in $O(1)$ test time',
      'Distance-weighted voting makes k-NN parametric',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_34',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'SVM Maximum Margin & Kernel Trick',
    category: 'theory',
    difficulty: 'exam',
    front: 'Which training points actually define the separating hyperplane of a linear Support Vector Machine (SVM), and what does the Kernel Trick do?',
    back: 'Only the closest boundary points with non-zero Lagrange multipliers (Support Vectors) determine the maximum-margin boundary. Kernels (RBF/Polynomial) compute inner products in high-dimensional spaces implicitly without explicitly transforming coordinates.',
    options: [
      'The centroid mean of all training instances',
      'Support Vectors on/inside the margin define the boundary; Kernels evaluate mapped inner products without explicit coordinate expansion',
      'Only misclassified outliers after 10 K-means steps',
      'Kernels reduce dimensionality via PCA',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_35',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Neural Networks & Backpropagation',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why can a single-layer Perceptron NOT solve XOR, whereas a Multi-Layer Perceptron (MLP) with non-linear activations (`ReLU`/`sigmoid`) + Backpropagation can?',
    back: 'A single Perceptron produces only a single linear hyperplane and XOR is not linearly separable; non-linear hidden layers compose piecewise non-linear decision boundaries trained via chain-rule gradient descent (Backpropagation).',
    options: [
      'Single Perceptrons lack input biases',
      'XOR is not linearly separable; hidden non-linear layers create non-linear feature spaces learned via gradient-descent backpropagation',
      'Linear hidden layers without activation already solve XOR cleanly',
      'Backpropagation guarantees global convex optimality on all deep MLPs',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_36',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Rare Class Accuracy Paradox (00 Inbox Recall)',
    category: 'theory',
    difficulty: 'exam',
    front: 'A rare disease affects 0.5% of patients. A dummy model always predicts "Healthy" and gets 99.5% Accuracy. Why is this useless and which metrics catch it?',
    back: 'Under severe class imbalance, Accuracy is dominated by True Negatives while Recall on the Positive class is 0%! Precision, Recall, F1-Score, and PR/ROC curves reveal that the model misses 100% of diseased cases.',
    options: [
      'Accuracy 99.5% proves the model is production-ready',
      '99.5% Accuracy achieves 0% Recall on the rare positive class; Precision, Recall, F1-score, and confusion matrix breakdown catch the failure',
      'Gini index ignores rare diseases intentionally',
      'Increasing Specificity to 100% maximizes sensitivity',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_37',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Precision vs Recall in Screening vs Spam',
    category: 'theory',
    difficulty: 'exam',
    front: 'Compare optimizing Recall (high sensitivity) for cancer screening vs optimizing Precision for blocking legitimate bank emails as spam:',
    back: 'High Recall (`TP/(TP+FN)`) minimizes missed diseased patients (False Negatives). High Precision (`TP/(TP+FP)`) minimizes false alarms blocking critical legitimate emails (False Positives). F1 is their harmonic mean.',
    options: [
      'Cancer screening wants low Recall so fewer patients are tested',
      'Cancer screening prioritizes Recall (avoid FN); blocking spam prioritizes Precision (avoid FP)',
      'Both Recall and Precision always increase together as threshold drops',
      'F1 is the arithmetic mean `(P+R)/2`',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_38',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'ROC Curve & AUC Interpretation',
    category: 'theory',
    difficulty: 'exam',
    front: 'On a ROC plot (`TPR` vs `FPR` across thresholds), what does a classifier falling along the diagonal `TPR = FPR` (AUC = 0.5) represent?',
    back: 'AUC = 0.5 represents random guessing with zero discriminative skill across thresholds, whereas `(0, 1)` top-left (`AUC = 1.0`) is perfect separation.',
    options: [
      'Perfect positive correlation',
      'No better than random coin-flipping (AUC = 0.5)',
      '100% Precision at all thresholds',
      'Guaranteed K-Means convergence',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_39',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'K-Means Objective (SSE) & Limitations',
    category: 'theory',
    difficulty: 'exam',
    front: 'What objective function does K-Means minimize at each assignment + centroid update step, and what shapes defeat it?',
    back: 'K-Means minimizes Sum of Squared Errors (`SSE = sum ||x - mu_k||^2`). It struggles with non-spherical/concentric clusters, differing densities/sizes, and extreme outliers (which pull centroids).',
    options: [
      'It maximizes Shannon entropy across arbitrary ring shapes',
      'Minimizes within-cluster SSE; weak on non-globular shapes, varying cluster sizes/densities, and outliers (sensitive to initial centroids)',
      'K-Means finds global optimum cleanly regardless of initialization',
      'DBSCAN SSE requires setting `K` upfront',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_40',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'DBSCAN: Density Reachability & Noise',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why can DBSCAN find nested horseshoe or moon-shaped clusters and automatically leave outliers unclustered, unlike K-Means?',
    back: 'DBSCAN grows density-connected components through overlapping Eps neighborhoods of Core points (`>= MinPts`), following arbitrary curved manifolds while leaving isolated low-density points as Noise.',
    options: [
      'DBSCAN runs K-Means with K=1000',
      'Density connectivity chains Core points across arbitrary non-convex shapes while excluding low-density points as Noise',
      'DBSCAN projects every dataset onto 1D line segments',
      'DBSCAN forbids any noise points from remaining unassigned',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_41',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Cluster Validity: Cohesion vs Separation',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why must internal clustering validity (like Silhouette) balance Cohesion against Separation rather than minimizing SSE alone?',
    back: 'SSE decreases monotonically as $K$ grows (hitting 0 when $K = N$ one point per cluster!). Balancing compact intra-cluster cohesion against wide inter-cluster separation identifies meaningful $K$ (or Elbow knee).',
    options: [
      'SSE increases when you double $K$',
      'SSE drops to 0 trivially at $K=N$; combining cohesion and separation reveals natural cluster structure',
      'Separation measures only training-set accuracy',
      'Internal validity requires ground-truth class labels',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_42',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Confounding & Simpson Paradox',
    category: 'theory',
    difficulty: 'exam',
    front: 'How can Simpson’s Paradox mislead an analyst evaluating treatment outcomes across hospitals?',
    back: 'A hidden confounding variable (such as patient severity) can reverse the apparent trend when subgroups are aggregated: Treatment A beats Treatment B inside BOTH mild and severe cohorts, yet appears worse in pooled totals.',
    options: [
      'It only occurs when normalizing ratios by Z-score',
      'A confounding variable reverses an aggregated correlation relative to stratified subgroups',
      'It describes a missing primary key in a Star Schema',
      'Apriori rules with Lift = 1 cause Simpson Paradox',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_43',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Privacy: k-Anonymity vs Differential Privacy',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why is simply stripping Direct Identifiers (Name/SSN) insufficient for privacy, and how do Quasi-Identifiers relate to $k$-Anonymity?',
    back: 'Quasi-identifiers (ZIP, Birthdate, Sex) uniquely link back ~87% of individuals via external datasets; $k$-Anonymity generalizes/suppresses QIs so each equivalence class has $\ge k$ rows (while $l$-diversity / Differential Privacy protect sensitive values).',
    options: [
      'Stripping Name makes re-identification mathematically impossible',
      'Quasi-identifiers combine to link individuals; $k$-Anonymity ensures every QI group matches at least $k$ records',
      '$k$-Anonymity encrypts SQL queries in ROLAP only',
      'Differential privacy removes all noise before publishing stats',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_44',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Algorithmic & Selection Bias',
    category: 'theory',
    difficulty: 'core',
    front: 'If a hiring classifier drops Gender explicitly, can it still discriminate via other features?',
    back: 'Yes — proxy / redundant variables (ZIP code, school, hobbies, career gap length) strongly correlate with protected attributes, propagating historical human decision bias inside training data.',
    options: [
      'No, dropping the protected column guarantees 100% fairness',
      'Yes, correlated proxy attributes and biased historical labels leak demographic bias into the model',
      'Only Decision Trees can show bias; Neural Networks are immune',
      'Normalization automatically removes sampling bias',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_45',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'SCD Type 1, Type 2 & Type 3',
    category: 'theory',
    difficulty: 'exam',
    front: 'When a store moves to a different sales district in a Data Warehouse, how does Slowly Changing Dimension (SCD) Type 2 preserve historical reporting?',
    back: 'Type 1 overwrites (loses history); Type 3 adds a `PreviousDistrict` column (only 1 prior state); Type 2 inserts a NEW dimension row with a new surrogate key + `ValidFrom/ValidTo` dates so old facts stay linked to the old district.',
    options: [
      'Type 2 deletes all old facts before the move date',
      'Type 2 inserts a new versioned dimension row with a fresh surrogate key and validity range, keeping old facts tied to the old row',
      'Type 1 preserves full historical versions',
      'Type 3 generates unlimited historical rows',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_46',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Sequence, Time-Series & Spatial Mining',
    category: 'theory',
    difficulty: 'core',
    front: 'What distinguishes Sequential Pattern Mining (e.g. PrefixSpan / GSP) from standard Association Rules?',
    back: 'Standard association rules treat each basket as an unordered set of simultaneous items, whereas sequential pattern mining tracks ordered events across timestamps per customer (`<Buy Camera> -> <Buy MemoryCard>`).',
    options: [
      'Sequential mining forbids any support threshold',
      'Sequential mining enforces temporal ordering between itemsets/events across a subject’s timeline',
      'Association rules must always involve GPS coordinates',
      'Time-series mining ignores order of timestamps',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_47',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'HOLAP Hybrid Architecture',
    category: 'theory',
    difficulty: 'core',
    front: 'How does HOLAP combine the strengths of ROLAP and MOLAP?',
    back: 'HOLAP stores fine-grained atomic base facts in scalable Relational (ROLAP) tables while caching precomputed summary cuboids in fast Multidimensional (MOLAP) arrays.',
    options: [
      'It splits SQL tables randomly across NoSQL JSON lakes',
      'Atomic granular facts live in scalable relational tables while aggregated summary cubes live in fast MOLAP arrays',
      'HOLAP disables both SQL and array storage',
      'It stores images inside B-Trees',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_48',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Fact Grain & Design Discipline',
    category: 'theory',
    difficulty: 'exam',
    front: 'In Dimensional Fact design, why must every row in a single Fact Table strictly adhere to ONE declared Fact Grain?',
    back: 'Mixing daily summaries and individual line-item receipts in the same Fact Table causes double-counting, broken SQL aggregations, and ambiguous foreign-key dimensions.',
    options: [
      'Because SQL SUM fails unless every column is INTEGER',
      'Mixing grains breaks additivity and causes severe double-counting when rolling up measures',
      'A Fact Table can only have 1 foreign key',
      'To turn a Star Schema into an unstructured Data Swamp',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_49',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'ETL vs ELT Tradeoffs',
    category: 'theory',
    difficulty: 'core',
    front: 'Why do modern cloud Data Lakes/Lakehouses frequently favor ELT over traditional ETL?',
    back: 'Traditional ETL transforms before loading into rigid Data Warehouses; ELT lands cheap raw files (`schema-on-read`) immediately into scalable cloud storage/compute and runs transformations downstream on demand.',
    options: [
      'ELT deletes raw source files before any transformation',
      'ELT extracts & loads raw data rapidly first and leverages elastic cloud compute to transform data in place on demand',
      'ETL cannot handle structured relational sources',
      'ELT eliminates all metadata catalogs',
    ],
    correctIndex: 1,
  },
  {
    key: 'ds_50',
    courseKey: 'data_science',
    subjectName: 'Data Science & DB Tech',
    conceptTitle: 'Pearson Correlation & Scale Invariance',
    category: 'theory',
    difficulty: 'exam',
    front: 'Suppose vector $y = 10x + 5$. What are the Euclidean distance, Cosine similarity, and Pearson correlation between $x$ and $y$?',
    back: 'Pearson correlation is invariant to positive linear shift + scaling (`r = +1.0`!). Euclidean distance is large, and Cosine similarity `< 1` if `+5` shifts the angle from the origin.',
    options: [
      'Euclidean = 0 and Pearson = 0',
      'Pearson correlation = +1.0 (invariant to linear offset & positive scale), whereas Euclidean > 0 and Cosine shifts due to the +5 offset',
      'Cosine ignores any constant offset +5',
      'Pearson correlation cannot detect linear scaling',
    ],
    correctIndex: 1,
  },
];

const CLOUD_COMP_CURATED = [
  {
    key: 'cc_09',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'COTS Hardware & OEM vs ODM',
    category: 'theory',
    difficulty: 'core',
    front: 'Why do hyperscale cloud providers often buy custom Commodity Off-The-Shelf (COTS) server designs directly from ODMs instead of branded OEM racks?',
    back: 'OEMs sell general-purpose branded servers with enterprise markup; ODMs build custom bare-metal open-rack specs (like OCP) tailored for hyperscaler power/cooling density at much lower CapEx.',
    options: [
      'ODMs include proprietary enterprise virtualization licenses by default',
      'Direct ODM specs strip unneeded enterprise extras and optimize rack power, density, and CapEx for hyperscale scale-out',
      'OEM servers cannot run Linux KVM',
      'COTS hardware eliminates software fault tolerance requirements',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_10',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Server Consolidation & Agility',
    category: 'theory',
    difficulty: 'core',
    front: 'How does Server Consolidation improve datacenter economics beyond hardware cost alone?',
    back: 'Packing multiple underutilized OS workloads onto fewer physical hosts cuts idle base power draw, cooling load, rack footprint, cabling, and enables fast snapshot/live migration.',
    options: [
      'Every VM still requires a dedicated physical motherboard',
      'It boosts physical CPU utilization, shrinks idle server power + cooling + rack space, and grants hardware-independent agility',
      'Consolidation guarantees zero security isolation between VMs',
      'It raises PUE toward 3.0',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_11',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Type-1 vs Type-2 Hypervisors & KVM',
    category: 'theory',
    difficulty: 'core',
    front: 'Why does Linux KVM bridge Type-1 and Type-2 hypervisor taxonomy cleanly?',
    back: 'Bare-metal Type-1 runs directly on hardware (`ESXi/Xen`); hosted Type-2 runs as an app on a host OS. KVM turns the Linux kernel itself into a Type-1 hypervisor module (`kvm.ko`) while reusing Linux scheduler, memory, and I/O stacks alongside userspace `QEMU`.',
    options: [
      'KVM runs inside a browser JavaScript engine',
      'KVM turns the Linux kernel into a hypervisor (`kvm.ko`) leveraging host OS scheduling/drivers while `QEMU` handles userspace device emulation',
      'KVM cannot execute Intel VT-x extensions',
      'Type-2 hypervisors always bypass hardware CPU virtualization',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_12',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Popek & Goldberg & x86 Sensitive Instructions',
    category: 'theory',
    difficulty: 'exam',
    front: 'According to Popek & Goldberg, why did classic x86 fail simple "Trap-and-Emulate" virtualization before VT-x?',
    back: 'Classical virtualization requires `Sensitive instructions ⊆ Privileged instructions`. Legacy x86 had ~17 sensitive instructions (like `POPF`, `SGDT`, `SIDT`, `SMSW`) that read/changed system state silently in Ring 1/3 without trapping!',
    options: [
      'Legacy x86 had no Ring 0 privilege level',
      '17 x86 sensitive instructions (e.g. `POPF`, `SMSW`, `SGDT`) failed silently instead of trapping when executed in non-Ring-0',
      'x86 CPUs could not run more than 16 MB of RAM',
      'Ring 3 executed faster than Ring 0',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_13',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Dynamic Binary Translation vs Paravirtualization',
    category: 'theory',
    difficulty: 'exam',
    front: 'Compare VMware’s classic Dynamic Binary Translation (BT) with Xen Paravirtualization (PV) before VT-x:',
    back: 'Binary Translation rewrites unsafe ring-0 guest kernel basic blocks on the fly into safe cached code (running unmodified guest OSes at slight JIT overhead). Paravirtualization modifies the guest OS source to issue explicit `hypercalls` directly to the hypervisor.',
    options: [
      'Binary translation requires recompiling Windows C source code',
      'BT dynamically rewrites sensitive guest kernel instructions at runtime for unmodified OSes; PV modifies guest OS source to call hypercalls',
      'Paravirtualization forbids any cooperation between guest OS and hypervisor',
      'Both require Intel EPT hardware tables',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_14',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Intel VT-x VMCS & VM-Exit/Entry',
    category: 'theory',
    difficulty: 'exam',
    front: 'Inside Intel VT-x, what is the role of the Virtual Machine Control Structure (VMCS)?',
    back: 'Per-vCPU 4KB structure storing Guest-state (regs/CR3), Host-state (restored on VM-exit), and VM-execution controls defining which guest events (CPUID, HLT, CR writes, EPT violations) trigger a `VM-exit` back into VMX Root mode.',
    options: [
      'A Docker network bridge inside `veth` pairs',
      'Stores Guest-state, Host-state, and control bitmaps governing `VM Entry` / `VM Exit` transitions in hardware',
      'An encrypted AES swap file inside Guest RAM',
      'Replaces the Linux `systemd` init process',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_15',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Shadow Page Tables vs EPT Two-Level Walk',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why did Shadow Page Tables incur heavy VM-Exit overhead compared to hardware Extended Page Tables (EPT/NPT)?',
    back: 'Without EPT, the hypervisor had to write-protect guest page tables and trap every guest page fault, `INVLPG`, and `CR3` context switch to keep synchronized `GVA->HPA` shadow tables. EPT walks `GVA->GPA->HPA` cleanly in MMU hardware (costing worse TLB miss latency only).',
    options: [
      'Shadow tables required guest applications to allocate 64-bit pointers only',
      'Shadow tables trapped every guest page-table write/`CR3` switch via VM-exit; EPT translates GPA->HPA directly in MMU hardware',
      'EPT causes more VM-exits on context switches than shadow page tables',
      'EPT removes guest page tables from Linux completely',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_16',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Nested Virtualization (L0 -> L1 -> L2)',
    category: 'theory',
    difficulty: 'exam',
    front: 'When running a nested hypervisor (L1) hosting VM L2 on physical host L0, who actually manages the physical VMCS hardware for L2?',
    back: 'Physical CPU runs only one true VMX Root (`L0`). When L1 executes `VMLAUNCH` (to enter L2), it VM-exits to L0, which merges L0+L1 controls into a Shadow/Merged `VMCS02` (accelerated by VMCS Shadowing) and enters L2 directly.',
    options: [
      'L1 enters physical VMX Root mode bypassing L0 completely',
      'L0 stays the sole VMX Root, intercepts L1 VMX instructions, merges VMCS state into `VMCS02`, and schedules L2',
      'L2 runs natively without any hypervisor isolation',
      'Nested virtualization requires Docker OverlayFS',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_17',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Memory Ballooning & KSM',
    category: 'theory',
    difficulty: 'exam',
    front: 'How does Memory Ballooning safely reclaim RAM from a running VM without crashing its guest OS?',
    back: 'The host asks the guest’s `virtio-balloon` driver to allocate & pin non-pageable pages inside the guest (inflating the balloon), forcing the guest OS to swap/reclaim its own least-needed cache cleanly and handing those GPAs back to the hypervisor.',
    options: [
      'The hypervisor randomly kills guest user processes from outside',
      'A guest balloon driver allocates & pins guest pages internally, letting the guest OS gracefully reclaim/page out cold cache before returning host frames',
      'KSM overwrites dirty guest pages with zeroes',
      'Memory ballooning expands physical DIMM sticks via ACPI',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_18',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'I/O Virtualization: Emulation vs Virtio vs SR-IOV',
    category: 'theory',
    difficulty: 'exam',
    front: 'Rank I/O virtualization modes from lowest performance (highest CPU overhead) to near-native wire speed:',
    back: 'Full device emulation (QEMU intercepts every PIO/MMIO trap) < Paravirtualized `virtio` with shared lock-free `virtqueue` ring buffers (+ `vhost-net` in kernel) < Hardware SR-IOV VF PCIe Passthrough (guest talks straight to NIC VF via IOMMU/VT-d).',
    options: [
      'SR-IOV Passthrough < Full Emulation < Virtio',
      'Full Emulation (PIO/MMIO traps) < Paravirtual `virtio`/`vhost-net` (shared ring buffers) < SR-IOV / VFIO Passthrough (IOMMU DMA)',
      'Virtio is slower than full ISA NE2000 emulation',
      'SR-IOV works seamlessly with zero hardware IOMMU and easy live migration',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_19',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Virtqueues & vhost-net',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why does `vhost-net` outperform standard QEMU `virtio-net` on high packet rates?',
    back: '`virtio-net` shares descriptor `virtqueues` between guest and userspace QEMU (extra kernel <-> QEMU context switches). `vhost-net` moves the backend `virtqueue` datapath directly into host kernel space while QEMU handles control/setup only.',
    options: [
      '`vhost-net` disables TCP checksums globally',
      '`vhost-net` processes `virtqueue` rings directly inside host kernel space, cutting QEMU userspace wakeups & copies',
      '`vhost-net` stores packets inside OverlayFS image layers',
      '`virtio` does not use shared memory rings',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_20',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Live VM Migration: Pre-Copy vs Post-Copy',
    category: 'theory',
    difficulty: 'exam',
    front: 'Contrast Pre-Copy vs Post-Copy Live VM Migration:',
    back: 'Pre-Copy copies all RAM while VM runs on Source, then iteratively sends dirty pages until a tiny remaining set triggers a brief pause ("stop-and-copy"). Post-Copy transfers CPU/minimal state first, resumes on Destination immediately, and faults remaining pages on demand (risk: crash if network/source fails mid-flight).',
    options: [
      'Pre-Copy shuts off the VM for the entire RAM copy',
      'Pre-Copy iteratively copies RAM/dirty pages before brief switchover (safe); Post-Copy switches fast and pulls pages on fault (risky on link loss)',
      'Post-Copy cannot migrate running CPU registers',
      'Both always migrate disk blocks faster if source network drops',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_21',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Libvirt & Virsh Architecture',
    category: 'theory',
    difficulty: 'core',
    front: 'What abstraction does `libvirt` (`libvirtd`, `virsh`, `virt-manager`) provide across KVM, Xen, and LXC?',
    back: 'A hypervisor-agnostic daemon, C/Python API, CLI (`virsh`), and XML domain definition schema to manage VM lifecycles, storage pools, and virtual networks uniformly.',
    options: [
      'A replacement for Linux kernel namespaces',
      'A unified daemon (`libvirtd`) + XML schema + CLI (`virsh`) API managing domains/networks across hypervisors like KVM and Xen',
      'An x86 instruction binary translator',
      'A Layer-3 BGP routing protocol',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_22',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Linux VM Networking: NAT vs Bridged vs Isolated',
    category: 'theory',
    difficulty: 'exam',
    front: 'If VMs need to be directly reachable from external hosts on the physical LAN with their own LAN IPs, which libvirt mode is required?',
    back: 'Bridged mode connects VM tap interfaces directly to a host bridge tied to the physical NIC (sharing LAN subnet + DHCP). NAT (`virbr0`) hides VMs behind host IP masquerading; Isolated has no external gateway.',
    options: [
      'Isolated mode',
      'Bridged mode',
      'NAT mode (default `virbr0`)',
      'USB serial loop',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_23',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Vagrant Boxes, Providers & Provisioners',
    category: 'theory',
    difficulty: 'core',
    front: 'In a `Vagrantfile`, distinguish a Vagrant Provider from a Provisioner:',
    back: 'The Provider creates/runs the VM instance from a base Box (e.g., VirtualBox, `vagrant-libvirt`), while the Provisioner configures OS packages/services inside the booted VM (Shell script, Ansible, Chef).',
    options: [
      'Provider configures NGINX inside the VM; Provisioner boots QEMU',
      'Provider manages the hypervisor VM lifecycle (VirtualBox/libvirt); Provisioner runs post-boot setup scripts/Ansible inside the guest',
      'Vagrant builds OverlayFS container images only',
      'Boxes contain live RAM snapshots of production servers',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_24',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Linux Namespaces: Mount, Net, UTS, IPC, User',
    category: 'theory',
    difficulty: 'core',
    front: 'Which Linux namespace isolates hostnames/domain names (`hostname`), and which isolates non-root UID 0 inside a container mapping to unprivileged UID 100000 on host?',
    back: '`UTS` namespace isolates hostname/NIS domain name; `User` namespace maps container `root` (`uid 0`) safely to an unprivileged host UID range; `Mount` (`mnt`) isolates filesystem mount points; `Net` isolates interfaces/ports/iptables.',
    options: [
      'PID isolates hostnames; Cgroup isolates IP addresses',
      '`UTS` isolates hostnames; `User` namespace maps container UID 0 cleanly to unprivileged host UIDs',
      'IPC isolates filesystem mounts',
      'Docker requires compiling a custom kernel per UID',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_25',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Cgroups v1/v2 Memory Limits & OOM',
    category: 'theory',
    difficulty: 'exam',
    front: 'What happens when processes inside a Docker/Linux cgroup exceed their hard `memory.limit_in_bytes` / `memory.max`?',
    back: 'The kernel stops host memory exhaustion by reclaiming cgroup page cache/swap first, and if still over budget triggers the cgroup OOM killer inside THAT container/cgroup (`Exit 137 / SIGKILL`) without harming neighbor containers.',
    options: [
      'The entire physical host reboots immediately',
      'Kernel reclaims pages in that cgroup and invokes the cgroup OOM killer (`Exit 137`) inside the offending container only',
      'The container automatically upgrades into a KVM VM',
      'CPU shares drop to zero until RAM clears',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_26',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Docker UnionFS / OverlayFS & Copy-on-Write',
    category: 'theory',
    difficulty: 'exam',
    front: 'In Docker Overlay2, what happens the FIRST time a running container modifies a 500 MB file stored inside a read-only image layer (`lowerdir`)?',
    back: 'OverlayFS performs **copy-up**: copies the entire 500 MB file from `lowerdir` into the container’s writable `upperdir` before writing — hurting first-write latency and duplicating space (why databases belong in Volumes/Bind Mounts!).',
    options: [
      'It patches the bytes directly in the shared `lowerdir` image for all containers',
      'Copy-up copies the whole 500 MB file into the container’s writable `upperdir` before modifying it (why DB data belongs on Volumes)',
      'Overlay2 forbids writing to existing image files',
      'The file moves silently into `tmpfs` swap',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_27',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Docker Volumes vs Bind Mounts vs tmpfs',
    category: 'theory',
    difficulty: 'core',
    front: 'Why are Docker Named Volumes preferred over Bind Mounts for production persistent database containers?',
    back: 'Named Volumes are fully managed by Docker under `/var/lib/docker/volumes` (portable across Linux/macOS/Windows, safe from host directory breakage, support volume drivers/backups), whereas Bind Mounts couple tightly to an exact host filesystem path.',
    options: [
      'Named Volumes live only in volatile RAM and vanish on container restart',
      'Named Volumes are portable Docker-managed storage (independent of host path layout); Bind Mounts depend directly on host directory paths; `tmpfs` stays in RAM',
      'Bind Mounts cannot share source code during development',
      'Named Volumes are read-only forever',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_28',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Network Namespaces & veth Pairs',
    category: 'trace',
    difficulty: 'exam',
    front: 'In standard Docker `bridge` networking, how does a container’s private `eth0` packet reach the physical host NIC?',
    back: 'Container `eth0` is one end of a virtual Ethernet (`veth`) pipe crossing the `net` namespace boundary into the host’s `docker0` Linux bridge, where host `iptables` NAT/MASQUERADE routes outbound packets via the host NIC.',
    options: [
      'Containers open raw SR-IOV hardware interrupts directly',
      'Via a `veth` pair connecting container `net` namespace (`eth0`) to host bridge `docker0` + kernel routing/`iptables` NAT',
      'Docker writes packets into an OverlayFS socket file',
      'BGP advertises container `172.17.0.x` directly to the Internet',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_29',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Dockerfile Layer Caching & Multistage Builds',
    category: 'trace',
    difficulty: 'exam',
    front: 'In a `Dockerfile`, why should `COPY package.json ./` + `RUN npm ci` appear BEFORE `COPY . .`, and why use Multistage Builds?',
    back: 'Each instruction creates a cached layer (invalidating all later layers once changed): copying `package.json` first reuses `npm ci` whenever only source code edits occur. Multistage (`FROM ... AS builder` -> final slim runtime `COPY --from=builder`) strips compilers/build tools from the shipped image.',
    options: [
      '`COPY . .` first maximizes cache hits',
      'Copying dependency manifests first preserves the `npm ci` layer cache across source edits; Multistage builds omit build toolchains from the final runtime image',
      'Multistage builds run two separate Linux kernels inside one container',
      '`ENTRYPOINT` deletes earlier layers',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_30',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Docker ENTRYPOINT vs CMD & Exec Form',
    category: 'trace',
    difficulty: 'exam',
    front: 'Why is `CMD ["node", "server.js"]` (exec JSON form) strongly preferred over `CMD node server.js` (shell form)?',
    back: 'Shell form wraps execution inside `/bin/sh -c`, making `sh` PID 1 instead of `node` — which can swallow `SIGTERM` signals on `docker stop` and wait for a 10s `SIGKILL` timeout!',
    options: [
      'Exec form runs faster because it uses Java bytecode',
      'Exec form makes your app PID 1 directly so `SIGTERM` handles graceful shutdown without `/bin/sh -c` absorbing signals',
      'Shell form cannot set environment variables',
      'Exec form bypasses `cgroups` limits',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_31',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'LXC System Containers vs Docker App Containers',
    category: 'theory',
    difficulty: 'exam',
    front: 'Compare traditional LXC system containers with Docker application containers:',
    back: 'LXC acts like a lightweight stateful "mini-VM" running a full `init/systemd` stack, SSH, cron, and mutable filesystem; Docker targets immutable, ephemeral, single-process microservices built from layered `Dockerfiles`.',
    options: [
      'LXC boots a separate Type-1 Xen kernel per container',
      'LXC acts as a multi-service OS container (`systemd`, persistent state); Docker favors immutable single-process layered images',
      'Docker cannot run on Linux cgroups',
      'LXC forbids networking namespaces',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_32',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Container Security & Shared Kernel Surface',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why is the attack surface of a container larger than that of a hardware-isolated KVM Virtual Machine?',
    back: 'All containers on a host share ONE host Linux kernel syscall boundary (~300+ syscalls), whereas VMs isolate behind a small hypervisor/hardware VT-x boundary (`seccomp-bpf`, capabilities drop, AppArmor, and UserNS/Kata/Firecracker microVMs mitigate this).',
    options: [
      'Containers use 4× slower virtual NICs',
      'Containers share one host Linux kernel syscall interface rather than isolated guest kernels behind VT-x hardware boundaries',
      'KVM VMs have no memory isolation',
      'Docker encrypts syscalls with BGP keys',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_33',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Cloud Deployment Models: Public, Private, Community, Hybrid',
    category: 'theory',
    difficulty: 'core',
    front: 'When does a Hybrid Cloud (Private on-prem + Public burst) beat pure Public or pure Private cloud?',
    back: 'Sensitive/steady baseline or regulated data runs on-premises (predictable CapEx + strict data control), while temporary peak demand or GPU/global workloads burst elastically into Public cloud.',
    options: [
      'When latency between regions must be zero',
      'Keeps steady/regulated data on-prem while bursting peak spikes elastically onto public infrastructure',
      'Hybrid clouds eliminate network bandwidth entirely',
      'Private clouds never use hypervisors',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_34',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Cloud Management & OpenStack Roles',
    category: 'theory',
    difficulty: 'exam',
    front: 'In IaaS cloud management (like OpenStack), match the core services: Compute, Networking, Object Storage, and Identity:',
    back: '`Nova` schedules VMs/compute; `Neutron` provides virtual L2/L3/SDN networking; `Swift` stores unstructured object blobs (S3-like) vs `Cinder` block volumes; `Keystone` handles auth/tokens; `Glance` manages VM images.',
    options: [
      'Swift schedules VMs; Nova handles Identity auth',
      'Nova = Compute, Neutron = Networking, Swift = Object Storage (Cinder = Block), Keystone = Identity',
      'Cinder replaces Linux namespaces',
      'Glance acts as a physical BGP edge router',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_35',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Cloud Network Interconnection: SDN & VXLAN',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why do multi-tenant cloud datacenters use VXLAN overlay tunneling instead of standard 802.1Q VLANs alone?',
    back: 'IEEE 802.1Q VLAN IDs are only 12 bits (max 4,094 isolated tenant networks!) and stress Top-of-Rack MAC tables; VXLAN encapsulates L2 frames inside UDP using a 24-bit VNI (~16.7 million isolated virtual networks) across routed L3 Spine-Leaf fabrics.',
    options: [
      'VLAN supports 16 million tenants natively without encapsulation',
      '802.1Q VLAN stops at 4,094 IDs; VXLAN offers 24-bit VNIs (~16M tenant segments) tunneled over scalable L3 IP Spine-Leaf fabrics',
      'VXLAN removes IP headers from all Internet traffic',
      'VXLAN runs purely inside client browsers',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_36',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Docker Networking: host vs none vs bridge',
    category: 'trace',
    difficulty: 'core',
    front: 'What happens if you launch a container with `docker run --network=host` vs `docker run --network=none`?',
    back: '`--network=host` skips creating a separate Network Namespace (container shares host ports directly, zero NAT overhead but port conflicts possible); `--network=none` leaves only `lo` loopback with zero external connectivity.',
    options: [
      '`--network=none` creates a public load balancer',
      '`--network=host` shares host net namespace directly (no NAT); `--network=none` provides loopback `lo` only (isolated)',
      'Both create a `docker0` veth bridge',
      '`--network=host` hides host NICs from PID 1',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_37',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Bind Mounts Inside Linux Mount Namespaces',
    category: 'theory',
    difficulty: 'exam',
    front: 'What does `mount --bind /var/data /mnt/jail/data` combined with `pivot_root` accomplish when assembling a container from scratch?',
    back: 'A bind mount makes an existing directory subtree visible at another mount point without copying data, and `pivot_root` swaps the container’s root `/` inside its Mount Namespace so it cannot see host root files.',
    options: [
      'It formats `/var/data` as a FAT32 floppy',
      'Exposes a directory subtree cleanly inside a new Mount Namespace so `pivot_root`/`chroot` jails `/` safely',
      'It launches QEMU live migration',
      'Copies 100% of host `/` into RAM',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_38',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Docker Daemon vs Rootless Containers / Containerd',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why does Docker delegate runtime spawning to `containerd` and `runc`, and what advantage do `Podman` / rootless runtimes offer?',
    back: '`dockerd -> containerd -> containerd-shim -> runc` creates OCI containers via `clone()`/`unshare()`, then exits `runc`. Rootless tools like `Podman` run daemonless inside User Namespaces without needing a privileged root daemon.',
    options: [
      '`runc` stays permanently as a hypervisor VM monitor',
      '`containerd`/`runc` follow OCI runtime specs via `clone`; rootless/daemonless runtimes use UserNS avoiding a single root-owned daemon',
      'Podman requires Type-1 VMware ESXi underneath',
      'Docker containers always run without `containerd`',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_39',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Vertical Scaling vs Horizontal Elasticity',
    category: 'theory',
    difficulty: 'core',
    front: 'Contrast Vertical Scaling (Scale-Up) vs Horizontal Elasticity (Scale-Out) in cloud applications:',
    back: 'Vertical scaling upgrades a single node’s vCPU/RAM (bounded by physical machine size and often reboot downtime); Horizontal elasticity adds/removes stateless instances behind a load balancer automatically on demand.',
    options: [
      'Vertical scaling has zero physical hardware limits',
      'Scale-Up adds resources to one instance (hardware cap); Scale-Out adds/removes parallel instances seamlessly with load balancers',
      'Horizontal scaling requires stateful SQL locks on every replica',
      'Vertical scaling reduces single points of failure',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_40',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Shared-Nothing vs Shared-Storage Live Migration',
    category: 'theory',
    difficulty: 'exam',
    front: 'In classic Datacenter Live VM Migration (`Pre-Copy`), why do hypervisors commonly place VM disk images on Shared Storage (NAS/SAN/Ceph)?',
    back: 'When VM disks reside on network shared storage, Live Migration only needs to copy active Guest RAM + CPU/device state over the network, finishing in seconds instead of copying terabytes of virtual disks.',
    options: [
      'Shared storage eliminates RAM transfer too',
      'Disk blocks stay accessible to destination host immediately over SAN/NAS, so migration only copies volatile RAM & vCPU state',
      'Live migration cannot transfer dirty memory pages over TCP',
      'Shared storage disables `virtio-blk`',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_41',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Edge vs Cloud Continuum: Split Inference Example',
    category: 'theory',
    difficulty: 'exam',
    front: 'Smart traffic cameras generate 4K video (50 Mbps each). How does an Edge-Cloud Continuum architecture handle inference vs long-term training?',
    back: 'Edge nodes near the intersection run lightweight object detection & send only compact metadata/cropped alerts over WAN (<1% bandwidth!), preserving raw local video privacy while centralized Cloud aggregates features for heavy fleet-wide model retraining.',
    options: [
      'Stream 100% raw 4K video over LTE to a distant region for 2ms braking alerts',
      'Process latency-sensitive detection & data filtering locally at the Edge while offloading fleet-wide storage & heavy training to the Cloud',
      'Run 1000-GPU LLM pretraining on each streetlamp controller',
      'Disable connectivity between edge and cloud forever',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_42',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'CPU Overcommitment & Ready Time',
    category: 'theory',
    difficulty: 'exam',
    front: 'If a physical 16-core KVM host runs 64 active vCPUs (4:1 overcommit) at 100% guest demand, what happens to latency-sensitive VMs?',
    back: 'CPU steal/ready time spikes because 64 runnable vCPUs compete for 16 physical hardware threads, creating scheduling jitter and lock-holder preemption stalls inside guest SMP kernels.',
    options: [
      'KVM dynamically manufactures 48 physical cores via cgroups',
      'CPU steal/ready-time queuing spikes and SMP lock-holder preemption degrades tail latency',
      'Memory ballooning speeds up vCPU clock frequency 4×',
      'Overcommitting vCPU reduces power consumption to 0 W',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_43',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Container Zombie Reaping & PID 1',
    category: 'trace',
    difficulty: 'exam',
    front: 'Inside a PID namespace, if your app spawns child helper processes that exit without their parent calling `wait()`, what can go wrong if container PID 1 ignores `SIGCHLD`?',
    back: 'Orphaned child processes are reparented to PID 1 inside the PID namespace; unlike host `systemd`, custom apps often fail to reap reparented zombies, exhausting the cgroup/namespace `pids.max` limit (`--init` / `tini` fixes this).',
    options: [
      'Orphans escape directly to the AWS Region root hypervisor',
      'Unreaped reparented children accumulate as defunct `<zombie>` processes until PID table/limit fills (`--init` solves this)',
      'Linux automatically pauses OverlayFS merges',
      'PID 1 stops responding to DNS queries',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_44',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'MicroVMs (Firecracker) vs Containers & VMs',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why do serverless platforms (e.g. AWS Lambda / Fargate) combine KVM microVMs like Firecracker with container images?',
    back: 'Traditional QEMU VMs carry legacy BIOS/PCI/device bloat (slow boot, high RAM); stripped-down KVM microVMs strip legacy devices to boot in ~125ms with <5MB overhead while preserving full VT-x/EPT hardware kernel isolation per multi-tenant function.',
    options: [
      'Firecracker removes the KVM kernel module entirely',
      'Stripped KVM microVMs eliminate legacy device emulation bloat for millisecond boot/tiny footprint while preserving hardware VT-x kernel isolation',
      'Containers provide stronger kernel isolation than VT-x hardware',
      'MicroVMs cannot pull OCI container filesystems',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_45',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Virtio-blk & I/O Virtualization Buffers',
    category: 'theory',
    difficulty: 'core',
    front: 'What two descriptor rings comprise a standard `virtqueue` in Virtio I/O virtualization?',
    back: 'The Guest driver posts outgoing buffer descriptors into the **Available Ring** (backed by Descriptor Table), and the Host backend deposits completed buffers into the **Used Ring**, cutting VM-exits via batch notification suppression.',
    options: [
      'L1 Tag Ring and L2 Victim Ring',
      'Available Ring (guest -> host requests) and Used Ring (host -> guest completions) referencing shared memory descriptors',
      'NAT Ring and BGP Ring',
      'Shadow Stack Ring and Literal Pool Ring',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_46',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Cloud Regions: Latency & Sovereignty',
    category: 'theory',
    difficulty: 'core',
    front: 'Give two primary reasons an architect selects `eu-south-1` (Milan) over `us-east-1` even if `us-east-1` is 10% cheaper:',
    back: '(1) Physical propagation latency (Milan-Turin RTT ~3–8ms vs transatlantic ~90–120ms) and (2) GDPR / Data Residency compliance keeping PII strictly inside EU jurisdiction.',
    options: [
      'Only US regions support Docker `cgroups`',
      'Lower user RTT latency and GDPR/legal data sovereignty within EU borders',
      '`eu-south-1` eliminates the speed of light limit',
      'Availability Zones inside `us-east-1` are disconnected from DNS',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_47',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Stateless Design & 12-Factor Container Apps',
    category: 'theory',
    difficulty: 'core',
    front: 'Why must horizontally auto-scaled containers externalize user sessions & uploads instead of saving them in the container’s OverlayFS layer?',
    back: 'Containers are ephemeral and traffic shifts across replicas behind a load balancer; local writable layer state disappears on scale-in or rolling update and diverges across replicas.',
    options: [
      'OverlayFS deletes files every 60 seconds cleanly',
      'Ephemeral horizontal scaling destroys local container layers and splits traffic across replicas (store state in external DB/Redis/Object Store)',
      'Containers run strictly read-only CPUs',
      'Load balancers copy container disks automatically',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_48',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'PCIe Passthrough & IOMMU (VT-d)',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why does PCIe/VFIO GPU or NIC Passthrough strictly require a hardware IOMMU (Intel VT-d / AMD-Vi)?',
    back: 'A physical PCIe device performs DMA directly to RAM bypassing CPU MMU/EPT; the IOMMU remaps device DMA targets from Guest Physical Addresses to authorized Host Physical Addresses so a malicious guest cannot overwrite host kernel RAM.',
    options: [
      'To accelerate Ethernet cables from 1 Gbps to 1 Tbps automatically',
      'IOMMU translates/isolates device DMA memory accesses (`GPA->HPA`) so passthrough hardware cannot corrupt host or sibling VM RAM',
      'Without IOMMU, Linux cgroups cannot limit CPU shares',
      'IOMMU converts Docker images into `.qcow2` disks',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_49',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Cgroups v2 Unified Hierarchy vs v1',
    category: 'theory',
    difficulty: 'exam',
    front: 'What architectural flaw in Linux `cgroups v1` motivated the unified single-tree hierarchy of `cgroups v2`?',
    back: 'In v1, each controller (`cpu`, `memory`, `blkio`) maintained independent directory hierarchies, causing conflicting process memberships and painful coordination (e.g., writeback I/O bandwidth billing against memory cgroups). v2 enforces one unified tree.',
    options: [
      'v1 supported zero memory limits',
      'v1 split controllers into unrelated orthogonal trees breaking writeback coordination; v2 uses one unified hierarchy per process',
      'v2 removed PID isolation entirely',
      'v1 required Microsoft Windows hosts',
    ],
    correctIndex: 1,
  },
  {
    key: 'cc_50',
    courseKey: 'cloud_comp',
    subjectName: 'Cloud Computing Technologies',
    conceptTitle: 'Datacenter PUE & Overhead Reduction',
    category: 'theory',
    difficulty: 'core',
    front: 'How do hyperscale facilities achieve PUE near 1.1 compared to legacy enterprise server closets near 2.0?',
    back: 'Eliminating double AC/DC UPS conversion losses, hot/cold aisle containment, raised intake temperature ranges, free outside-air / evaporative cooling, and efficient liquid/direct-to-chip heat exchangers.',
    options: [
      'Shutting off cooling fans and letting CPUs melt at 115 °C',
      'Hot/cold aisle containment, free outside-air/evaporative economizers, raised ambient intake, and streamlined power distribution',
      'Moving all servers inside VMware Type-2 VirtualBox',
      'Doubling server power supply idle losses',
    ],
    correctIndex: 1,
  },
];

const INTERNET_ARCH_CURATED = [
  {
    key: 'ia_09',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'RFC 3021 /31 Point-to-Point Links',
    category: 'theory',
    difficulty: 'exam',
    front: 'On a router-to-router serial/Ethernet point-to-point link using a `/31` subnet (RFC 3021), how many usable host IPs exist?',
    back: 'RFC 3021 allows 2 usable peer addresses in a `/31` without reserving network or broadcast addresses (conserving 50% IPv4 space compared to `/30`), using directed L2 delivery instead of IP broadcast.',
    options: [
      '0 usable hosts because 2^1 - 2 = 0 everywhere',
      '2 usable peer addresses (RFC 3021 waives network & broadcast reservations on point-to-point links)',
      '1 usable host and 1 gateway',
      '4 usable hosts',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_10',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Special IPv4 Blocks & RFC 1918',
    category: 'theory',
    difficulty: 'core',
    front: 'Identify the special purpose of `169.254.0.0/16`, `127.0.0.0/8`, and `172.16.0.0/12`:',
    back: '`169.254.0.0/16` = Link-Local (APIPA when DHCP fails); `127.0.0.0/8` = Loopback interface; `172.16.0.0–172.31.255.255` = RFC 1918 private Class-B block (alongside `10/8` and `192.168/16`).',
    options: [
      '`169.254/16` is public AT&T BGP space; `172.32/16` is private',
      '`169.254/16` = Link-Local (APIPA), `127/8` = Loopback, `172.16/12` = RFC 1918 private block',
      '`127.0.0.1` routes packets across OSPF Area 0',
      '`192.169.0.0/16` is private RFC 1918 space',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_11',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'ARP Broadcast & Static Routing Forwarding',
    category: 'trace',
    difficulty: 'exam',
    front: 'Host A (`10.0.1.5/24`) sends an IP packet to remote server `8.8.8.8` via default gateway `10.0.1.1`. Whose MAC address goes into the Ethernet Destination header leaving Host A?',
    back: 'An L2 frame only spans the local broadcast domain! Host A compares `8.8.8.8` against `/24` -> off-link -> ARPs for the GATEWAY `10.0.1.1`’s MAC address (while the inner IP Destination stays `8.8.8.8`).',
    options: [
      'Host A sends an ARP broadcast globally for `8.8.8.8` across the Internet',
      'Ethernet Dest MAC = Gateway `10.0.1.1`’s MAC, while IP Dest stays `8.8.8.8`',
      'Ethernet Dest MAC = `ff:ff:ff:ff:ff:ff` and IP Dest is rewritten to `10.0.1.1`',
      'ARP is skipped because switches inspect BGP AS_PATH',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_12',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Routing Loops & IP TTL Behavior',
    category: 'trace',
    difficulty: 'exam',
    front: 'When two routers have mutually inconsistent static routes forming a forwarding loop, what prevents packets from circulating forever?',
    back: 'Each router decrements the IPv4 `TTL` (or IPv6 `Hop Limit`) by 1 upon forwarding and recomputes the IPv4 header checksum; upon `TTL == 0`, the packet is dropped and `ICMP Time Exceeded (Type 11, Code 0)` is returned.',
    options: [
      'The Ethernet switch drops duplicate frames after 2 hops via Spanning Tree',
      'Routers decrement IP `TTL` every hop; reaching 0 drops the packet and returns `ICMP Time Exceeded`',
      'ARP cache expires after 3 packets',
      'Routers rewrite Destination IP to `0.0.0.0`',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_13',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Packet Capture Visibility on Switch vs Hub',
    category: 'theory',
    difficulty: 'exam',
    front: 'Host C runs Wireshark on an L2 Ethernet Switch (non-SPAN port) while Host A transfers a file to Host B. Which frames will Host C observe?',
    back: 'After the switch learns Host A and Host B’s MAC ports, unicast frames between A and B are forwarded strictly between those two ports! Host C only sees its own traffic plus L2 broadcasts (ARP/DHCP) and multicast.',
    options: [
      'Every single unicast TCP payload packet between A and B',
      'Only Broadcast/Multicast/Unknown-unicast frames and traffic addressed to/from C itself (unless port mirroring/SPAN is configured)',
      'Nothing at all including ARP broadcasts',
      'All HTTPS decrypted TLS keys',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_14',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'DNS Iterative vs Recursive & Proxy Mechanics',
    category: 'theory',
    difficulty: 'exam',
    front: 'When diagnosing slow browsing via Wireshark at a client behind an HTTP Forward Proxy vs direct access, what changes in the packet trace?',
    back: 'Direct access shows client DNS queries (`UDP 53`) and TCP flows straight to origin server IPs. Behind an explicit HTTP Forward Proxy, the client opens TCP to the PROXY IP:port and delegates origin DNS resolution + TLS/HTTP to the proxy.',
    options: [
      'An HTTP Forward Proxy forces the browser to run OSPF Area 0',
      'Client sends `CONNECT`/HTTP requests directly to the Proxy IP:port instead of querying external DNS or opening direct origin TCP flows',
      'Reverse proxies live exclusively inside browser extensions',
      'DNS always uses TCP port 179 through proxies',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_15',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv4 Route Aggregation (Supernetting)',
    category: 'trace',
    difficulty: 'exam',
    front: 'To reduce BGP/routing table entries without sweeping in unrelated subnets, what is the tightest single CIDR aggregate covering `192.168.4.0/24`, `192.168.5.0/24`, `192.168.6.0/24`, and `192.168.7.0/24`?',
    back: 'The third octets `4..7` in binary are `00000100` to `00000111` — top 6 bits of the 3rd octet (`8+8+6 = 22` bits) stay identical and low 2 bits span all 4 `/24`s cleanly -> `192.168.4.0/22`!',
    options: ['`192.168.4.0/23`', '`192.168.4.0/22`', '`192.168.0.0/21`', '`192.168.4.0/20`'],
    correctIndex: 1,
  },
  {
    key: 'ia_16',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv4 Multicast to Ethernet MAC Loss',
    category: 'theory',
    difficulty: 'exam',
    front: 'How many distinct IPv4 Class-D multicast addresses (`224.0.0.0/4`) collide onto the SAME Ethernet multicast MAC address `01:00:5e:xx:yy:zz`?',
    back: 'IPv4 addresses have 28 variable multicast bits (32 - 4 `1110` prefix bits), yet Ethernet MAC mapping copies only the lower 23 bits into `01:00:5e:` (leaving 5 ignored bits = `2^5 = 32` colliding IPs per L2 MAC, so software IP stack must still filter!).',
    options: [
      '1:1 unique mapping — zero collisions',
      '32 multicast IPv4 addresses collide per MAC (`28 - 23 = 5` ignored bits -> `2^5 = 32`)',
      '256 addresses collide per MAC',
      '8 addresses collide per MAC',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_17',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IGMPv2 Membership Suppression & Leave',
    category: 'theory',
    difficulty: 'exam',
    front: 'When a multicast router sends an IGMPv2 General Membership Query on an Ethernet LAN with 10 hosts subscribed to `239.1.1.1`, how many hosts normally transmit an IGMP Report?',
    back: 'Host Report Suppression: each host starts a random backoff timer and sends its report to the group multicast IP; once 1 host replies, the other 9 see it on the LAN and suppress redundant reports! On Leave (`224.0.0.2`), the router sends a Group-Specific Query (`G`) to confirm if any listener remains.',
    options: [
      'All 10 hosts always flood the router simultaneously',
      'Typically 1 host responds first after random timer backoff and others suppress duplicate reports',
      'The router broadcasts a TCP SYN to port 5353',
      'mDNS blocks all IGMP queries on `224.0.0.1`',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_18',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Multicast Distribution Trees & RPF Check',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why do IP multicast routers run a Reverse Path Forwarding (RPF) check before forwarding incoming multicast packets?',
    back: 'Without RPF, flooding multicast packets across cyclic meshes causes devastating L3 broadcast storms/loops. RPF accepts a multicast packet from source `S` ONLY if it arrived on the interface the unicast routing table uses to reach `S`.',
    options: [
      'To encrypt multicast payloads with BGP communities',
      'To prevent routing loops by accepting multicast `(S, G)` packets only on the shortest unicast reverse-path interface toward `S`',
      'To assign IPv6 SLAAC prefixes automatically',
      'To split every TCP stream across 5 paths',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_19',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'mDNS (Multicast DNS) Local Discovery',
    category: 'theory',
    difficulty: 'core',
    front: 'Over which address and port does mDNS (`.local` service discovery like AirPlay/Bonjour) operate, and why does it stay within a single L2 link?',
    back: 'UDP port 5353 using Link-Local Multicast `224.0.0.251` (`ff02::fb` in IPv6) with TTL = 1 / Link-Local scope so local devices resolve `.local` names without a central DNS server or crossing routers.',
    options: [
      'TCP port 443 to `8.8.8.8` across BGP peers',
      'UDP port 5353 to Link-Local Multicast `224.0.0.251` (`ff02::fb`), confined to the local LAN',
      'IP protocol 89 inside OSPF Area 0',
      'UDP port 67 via `127.0.0.1`',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_20',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'GSM IMSI, Ki, AuC & TMSI Security',
    category: 'theory',
    difficulty: 'exam',
    front: 'In 2G/LTE/5G cellular security, why does the network assign a temporary `TMSI` over the air instead of repeatedly transmitting the SIM’s `IMSI` and `K_i`?',
    back: 'Transmitting permanent subscriber identity `IMSI` continuously enables trivial radio tracking; temporary `TMSI` changes per Location Area/paging, while root secret `K_i` NEVER leaves the SIM and AuC (challenge-response `RAND -> SRES` authenticates!).',
    options: [
      '`K_i` is broadcast in cleartext every GSM frame',
      '`K_i` never leaves the SIM/AuC; `TMSI` hides permanent `IMSI` over wireless paging channels against passive tracking',
      '`TMSI` replaces TCP congestion control',
      'EIR stores user passwords for HTTP basic auth',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_21',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Cellular Location Update vs Paging Tradeoff',
    category: 'theory',
    difficulty: 'exam',
    front: 'What happens to control-plane overhead when a cellular operator makes Location Areas (LAs) VERY small (e.g. 1 cell per LA) vs VERY large?',
    back: 'Tiny LAs eliminate Paging overhead (exact cell known!) at the cost of massive Location Update signaling whenever idle phones move; huge LAs minimize Location Updates but force the network to Page dozens/hundreds of cells per incoming call.',
    options: [
      'Larger LAs raise Location Updates and drop Paging to zero',
      'Smaller LAs increase Location Update signaling while cutting Paging broadcast load; larger LAs do the reverse',
      'Handover only happens in 1-cell LAs',
      '5G Core removes both paging and registration',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_22',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: '5G Core Slicing & Radio Architecture',
    category: 'theory',
    difficulty: 'exam',
    front: 'Which 3 service classes drive 5G Network Slicing over a shared physical infrastructure?',
    back: '`eMBB` (Enhanced Mobile Broadband: Gbps video), `URLLC` (Ultra-Reliable Low-Latency Communications: ~1ms industrial/auto control), and `mMTC` (Massive Machine-Type Communications: high-density low-power IoT sensors).',
    options: [
      'OSPF, BGP, and RIPv2',
      '`eMBB` (high bandwidth), `URLLC` (low latency/reliability), and `mMTC` (massive IoT density)',
      'TDM, EPT, and VT-x',
      'NAT44, NAT64, and MAP-T',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_23',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv6 Header Simplifications vs IPv4',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why is the fixed IPv6 base header (40 bytes) simpler for high-speed routers to process than the variable IPv4 header despite 4× longer addresses?',
    back: 'IPv6 removed IHL length parsing, Header Checksum recomputation at every hop (relying on L2 + TCP/UDP checksums), and transit Router Fragmentation fields — instead chaining optional features via `Next Header` extensions.',
    options: [
      'IPv6 routers recompute 3 different CRC checksums per packet',
      'IPv6 has a fixed 40B header with NO IHL, NO per-hop IP header checksum, and NO in-router fragmentation fields',
      'IPv6 shrinks addresses from 32 bits to 16 bits',
      'IPv6 runs inside UDP port 5353',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_24',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv6 Scopes & Address Types',
    category: 'theory',
    difficulty: 'core',
    front: 'Match the IPv6 address prefixes: `::1`, `fe80::/10`, `fc00::/7`, and `ff00::/8`:',
    back: '`::1` = Loopback; `fe80::/10` = Link-Local (auto-configured on every IPv6 interface, non-routable across routers); `fc00::/7` (`fd00::/8`) = Unique Local Address (ULA, private LAN routing); `ff00::/8` = Multicast (broadcast does NOT exist in IPv6!).',
    options: [
      '`fe80::/10` is global public BGP Internet space; `ff00::/8` is broadcast',
      '`::1` = Loopback, `fe80::/10` = Link-Local, `fc00::/7` = Unique Local (ULA), `ff00::/8` = Multicast',
      '`2000::/3` is strictly non-routable loopback',
      'IPv6 reserves `255.255.255.255` for ARP broadcasts',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_25',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv6 EUI-64 & Privacy Extensions (RFC 4941)',
    category: 'trace',
    difficulty: 'exam',
    front: 'Why did OSes introduce RFC 4941 Temporary IPv6 Privacy Interface Identifiers instead of always deriving `/64` IIDs via Modified EUI-64 from the hardware MAC?',
    back: 'Modified EUI-64 embeds your permanent 48-bit MAC (inserting `ff:fe` + flipping the 7th U/L bit), letting every remote server track your physical laptop globally across Wi-Fi networks! Privacy IIDs rotate randomized IIDs for outbound connections.',
    options: [
      'EUI-64 only generates 32-bit addresses',
      'Static EUI-64 embeds your permanent hardware MAC in every global IPv6 packet enabling cross-network tracking; Privacy Extensions randomize rotating IIDs',
      'Privacy extensions disable ICMPv6 DAD',
      'MAC addresses expire every 30 seconds in Ethernet switches',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_26',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv6 NDP, Solicited-Node Multicast & DAD',
    category: 'theory',
    difficulty: 'exam',
    front: 'Instead of broadcasting ARP to every host on a /64 LAN, how does ICMPv6 Neighbor Solicitation resolve a neighbor’s MAC and run Duplicate Address Detection (DAD)?',
    back: 'NS targets the target’s **Solicited-Node Multicast** address (`ff02::1:ffXX:XXXX`, matching the last 24 bits of the IPv6 address), waking only hosts whose NIC listens to that narrow multicast group. In DAD, a host sends NS from `::` (unspecified) checking for replies.',
    options: [
      'ICMPv6 floods `255.255.255.255` via UDP 67',
      'NS targets the narrow Solicited-Node Multicast (`ff02::1:ff` + low 24 bits) for both L2 resolution and DAD (`src = ::`)',
      'IPv6 switches rely on IGMPv1 broadcasts only',
      'RA packets assign individual MAC addresses',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_27',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv6 Path MTU Discovery (PMTUD)',
    category: 'theory',
    difficulty: 'exam',
    front: 'Since IPv6 routers NEVER fragment packets in transit, what happens if a 1500B IPv6 packet hits a 1280B MTU bottleneck link?',
    back: 'The bottleneck router drops the packet and sends back `ICMPv6 Packet Too Big (Type 2)` stating Next-Hop MTU = 1280 (the mandatory IPv6 minimum MTU!), and the original sender caches Path MTU and reduces segment size / fragments end-to-end.',
    options: [
      'The router fragments the packet into two 750B IPv6 fragments automatically',
      'Router drops packet and returns `ICMPv6 Packet Too Big (MTU 1280)`; the sender lowers its packet/MSS size (min IPv6 MTU = 1280 B)',
      'The packet switches automatically to IPv4 mid-flight',
      'TCP sets window = 0 permanently',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_28',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'SLAAC Flags (M & O) vs DHCPv6',
    category: 'theory',
    difficulty: 'exam',
    front: 'In an IPv6 Router Advertisement (`RA`), what do the `M` (Managed) and `O` (Other Configuration) flags instruct a host to do?',
    back: '`M=0, O=0` = pure SLAAC (prefix from RA, RDNSS DNS option if present); `M=0, O=1` = SLAAC generates IPv6 address + Stateless DHCPv6 provides DNS/NTP; `M=1` = Stateful DHCPv6 assigns the IPv6 address too.',
    options: [
      '`M=1` disables all IPv6 gateways',
      '`M=1` requests IPv6 address from Stateful DHCPv6; `M=0, O=1` pairs SLAAC addressing with Stateless DHCPv6 options (e.g. DNS)',
      '`O=1` activates OSPF routing inside laptops',
      'Both `M` and `O` encrypt Wi-Fi frames',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_29',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv6 Transition: DS-Lite vs NAT64/DNS64 & 464XLAT',
    category: 'theory',
    difficulty: 'exam',
    front: 'In an IPv6-only cellular mobile network (no IPv4 at all on LTE radio), how does `464XLAT` allow legacy IPv4-only apps (hardcoded `1.2.3.4` sockets) to still connect?',
    back: 'Pure `NAT64+DNS64` translates DNS `A` lookups into `64:ff9b::IPv4`, failing if an app bypasses DNS with raw IPv4 literals. `464XLAT` runs a stateless translator `CLAT` on the phone (`IPv4 -> IPv6`), traverses the carrier IPv6 core, and stateful `PLAT` (`NAT64`) translates back to IPv4!',
    options: [
      'It installs an Ethernet cable to every smartphone',
      'Stateless `CLAT` on the device translates IPv4 literals into IPv6 packets across the IPv6 core to the carrier stateful `PLAT` (NAT64)',
      '`DS-Lite` runs dual native IPv4 on the LTE radio link',
      'MAP-T converts IPv4 addresses into BGP ASNs',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_30',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'MAP-E & MAP-T Address+Port (A+P) Sharing',
    category: 'theory',
    difficulty: 'exam',
    front: 'How do `MAP-E` (encapsulation) and `MAP-T` (translation) allow ISPs to share 1 public IPv4 address across 16 customers WITHOUT stateful CGNAT tables in the core?',
    back: 'They encode the customer’s shared public IPv4 AND their dedicated Port Set ID (`PSID`, e.g., 4096 TCP/UDP ports!) directly inside bits of the customer’s delegated IPv6 prefix (`A+P`), making carrier border relay stateless and deterministic!',
    options: [
      'By caching millions of per-flow NAT bindings in core AFTR RAM like DS-Lite',
      'By embedding shared IPv4 + deterministic Port-Set ID (`PSID`) inside each subscriber’s IPv6 prefix so border relays are 100% stateless',
      'By disabling TCP/UDP source ports completely',
      'By forcing every home router to run full-table BGP',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_31',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Distance Vector vs Link State Convergence',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why can Distance Vector protocols (RIP / Bellman-Ford) suffer Count-to-Infinity loops on link failures, whereas Link State (OSPF / Dijkstra) converges cleanly?',
    back: 'Distance Vector learns "routing by rumor" from immediate neighbors’ total distance vectors (Split Horizon + Poison Reverse help 2-node loops, not arbitrary cycles). Link State floods complete topology LSAs so every router runs Dijkstra locally on an identical LSDB map.',
    options: [
      'Distance Vector knows every router’s complete link map globally',
      'DV trades neighbor distance vectors ("by rumor", risking count-to-infinity in 3+ cycles); Link State floods full link maps so every node runs SPF independently',
      'Dijkstra cannot compute shortest paths with weights > 10',
      'Link State uses TCP port 179 while RIP uses IP proto 89',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_32',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'OSPF Hello, DR/BDR Election & LSA Types',
    category: 'theory',
    difficulty: 'exam',
    front: 'On a broadcast Ethernet segment with 20 OSPF routers, why do they elect a DR & BDR, and which LSA does the DR flood?',
    back: 'Without a DR/BDR, 20 routers would form `20*19/2 = 190` full OSPF adjacencies! Instead, DROthers only form FULL adjacencies with DR (`224.0.0.6`) and BDR; the DR originates a single **Type 2 (Network) LSA** describing the LAN. DR/BDR election is non-preemptive!',
    options: [
      'Every router still forms $N(N-1)/2$ full adjacencies and sends Type 5 LSAs',
      'Electing DR/BDR reduces adjacencies from $O(N^2)$ to $O(N)$ (`DROthers` sync with DR/BDR only); DR sends Type 2 Network LSAs; election is non-preemptive',
      'A higher-priority router joining later immediately preempts and overthrows the DR',
      'The DR forwards every packet on behalf of DROthers at the data plane',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_33',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'OSPF Stub, NSSA & ASBR External Routes',
    category: 'theory',
    difficulty: 'exam',
    front: 'How do OSPF Type 3 (ABR Summary), Type 4 (ASBR Summary), and Type 5 (External) LSAs work together when an ASBR in Area 1 injects a static/BGP route into Area 0 and Area 2?',
    back: 'The ASBR floods a **Type 5 External LSA** across all normal areas identifying `Advertising Router = ASBR Router ID` (never changed!). ABRs generate **Type 4 ASBR Summary LSAs** into other areas so routers in Area 2 know how to reach that ASBR, alongside Type 3 internal prefixes.',
    options: [
      'Type 5 LSAs are rewritten by every transit router',
      'ASBR originates Type 5 External LSAs AS-wide; ABRs originate Type 4 LSAs telling other areas how to reach the ASBR + Type 3 for internal prefixes',
      'Area 2 cannot reach external routes unless merged into Area 0',
      'Type 2 LSAs advertise BGP Internet routes',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_34',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'BGP: eBGP vs iBGP Split Horizon & NEXT_HOP',
    category: 'theory',
    difficulty: 'exam',
    front: 'Why must iBGP peers inside an AS normally form a Full Mesh (or use Route Reflectors), and how does `NEXT_HOP` behave between eBGP and iBGP?',
    back: 'To prevent intra-AS loops without AS_PATH changes, an iBGP speaker does NOT re-advertise routes learned from one iBGP peer to another iBGP peer (requiring full mesh / RR!). Also, by default eBGP changes `NEXT_HOP` to its own IP, while iBGP preserves the external `NEXT_HOP` (`next-hop-self` or IGP reachability needed!).',
    options: [
      'iBGP automatically adds its ASN to AS_PATH and floods routes to all other iBGP peers',
      'iBGP forbids re-advertising iBGP-learned routes to other iBGP peers (needs full mesh / RR) and preserves eBGP `NEXT_HOP` unless `next-hop-self` is set',
      'eBGP requires routers to share the exact same ASN',
      'BGP runs over OSPF Hellos instead of TCP 179',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_35',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'BGP Policy: Valley-Free Routing & Transit vs IXP',
    category: 'theory',
    difficulty: 'exam',
    front: 'Under the BGP Valley-Free (Gao-Rexford) commercial routing model, which prefixes should ISP A announce to its Paid Upstream Transit Provider T and Peer P?',
    back: 'To avoid providing free transit between T and P (money-losing!), ISP A announces to its Upstream Provider T and Peer P ONLY its own routes + its paying **Customers’** routes — NEVER routes learned from other Peers or Upstream Providers! (Routes learned from Customers go everywhere.)',
    options: [
      'Re-advertise Upstream Provider T’s full Internet table back to Peer P for free',
      'Advertise ONLY own + Customer prefixes to Peers and Providers; advertise Customer + Peer + Provider routes to Customers',
      'Drop all Customer routes at Internet Exchange Points (IXPs)',
      'Prefer Upstream Provider routes (`LOCAL_PREF 300`) over Settlement-Free Peers and Customers',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_36',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'BGP Loop Prevention & MED vs LOCAL_PREF',
    category: 'theory',
    difficulty: 'exam',
    front: 'Contrast `LOCAL_PREF` vs `MED` (Multi-Exit Discriminator) in BGP path selection:',
    back: '`LOCAL_PREF` (highest wins, default 100) stays strictly internal inside an AS to choose the preferred EXIT point for outbound traffic. `MED` (lowest wins) is sent across eBGP links between two neighboring ASes as a hint asking how to ENTER our AS (evaluated AFTER `AS_PATH` length!).',
    options: [
      'Lowest `LOCAL_PREF` beats highest `MED` globally across the whole Internet',
      '`LOCAL_PREF` (highest wins, intra-AS) steers outbound exits early in BGP decision; `MED` (lowest wins, inter-neighbor) hints preferred inbound entry after `AS_PATH`',
      '`MED` is evaluated before `LOCAL_PREF`',
      'BGP uses Dijkstra SPF instead of `AS_PATH`',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_37',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: '4G LTE Control vs User Plane & GTP Tunneling',
    category: 'theory',
    difficulty: 'exam',
    front: 'In 4G LTE EPC, how does a user’s IP packet flow from the `eNodeB` radio tower to the Internet `P-GW`, and who signals bearer setup?',
    back: '`MME` handles all NAS/S1-AP Control Plane signaling (auth via `HSS`, paging, handover setup), while User Plane IP packets are encapsulated in `GTP-U` UDP tunnels `eNodeB <-> S-GW <-> P-GW` so user IP stays constant as `eNodeB` changes!',
    options: [
      'MME forwards every HTTP packet directly at L3 without GTP',
      '`MME` manages Control Plane signaling (`HSS`), while User Plane packets travel inside `GTP-U` tunnels `eNodeB <-> S-GW <-> P-GW`',
      '`P-GW` sits directly on top of the radio antenna mast',
      'LTE uses `MSC/VLR` circuit switches exclusively for data',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_38',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'GSM TDMA Frames & Timing Advance',
    category: 'theory',
    difficulty: 'exam',
    front: 'If a mobile phone moves 30 km away from a GSM `BTS`, what fails if the `BTS` stops adjusting Timing Advance (`TA`)?',
    back: 'Round-trip speed-of-light propagation delay (~200 µs at 30 km!) shifts the mobile’s TDMA burst late so it collides with the NEXT user’s assigned timeslot at the `BTS` antenna.',
    options: [
      'The SIM card loses its `K_i` encryption key',
      'Propagation delay misaligns the phone’s TDMA burst so it collides into the adjacent user’s timeslot at the `BTS`',
      'The `HLR` deletes the user’s phone number',
      'LTE `GTP-U` header checksums fail',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_39',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Soft vs Hard Handover & Cell Breathing',
    category: 'theory',
    difficulty: 'exam',
    front: 'Contrast Hard Handover ("break-before-make" in GSM/LTE) vs Soft Handover ("make-before-break" in 3G CDMA):',
    back: 'Hard Handover drops the old radio channel/frequency cleanly before tuning to the target cell; Soft Handover maintains simultaneous links to two base stations on the same CDMA frequency band at cell edges.',
    options: [
      'GSM/LTE use soft simultaneous multi-frequency links permanently',
      'Hard Handover switches channels/frequencies break-before-make (GSM/LTE); Soft Handover holds simultaneous cell links make-before-break (WCDMA)',
      'Soft Handover never requires base station coordination',
      'Hard Handover requires shutting down the user SIM for 10 seconds',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_40',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv4 vs IPv6 Static Longest Prefix Match',
    category: 'trace',
    difficulty: 'exam',
    front: 'A routing table contains `10.20.0.0/16 -> eth0`, `10.20.4.0/24 -> eth1`, `10.20.4.128/25 -> eth2`, and `0.0.0.0/0 -> eth3`. Out which interface does `10.20.4.200` exit?',
    back: '`10.20.4.200` matches ALL four routes! Longest Prefix Match picks the most specific matching mask length: `/25` (`10.20.4.128–.255`) beats `/24`, `/16`, and `/0` -> exits `eth2`.',
    options: ['`eth0` (`/16`)', '`eth1` (`/24`)', '`eth2` (`/25`)', '`eth3` (`/0`)'],
    correctIndex: 2,
  },
  {
    key: 'ia_41',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'NAT64 Stateful Binding & 64:ff9b::/96',
    category: 'trace',
    difficulty: 'exam',
    front: 'In `DNS64 + NAT64`, an IPv6-only client resolves an IPv4-only server `93.184.216.34` (`0x5d.0xb8.0xd8.0x22`). What synthetic IPv6 address does DNS64 return?',
    back: 'When no native `AAAA` record exists, DNS64 embeds the 32-bit IPv4 `93.184.216.34` (`5db8:d822`) inside the Well-Known NAT64 Prefix `64:ff9b::/96` -> `64:ff9b::5db8:d822` (or `64:ff9b::93.184.216.34`).',
    options: [
      '`fe80::5db8:d822`',
      '`64:ff9b::5db8:d822` (`64:ff9b::/96` + IPv4 32 bits)',
      '`ff02::1:ff22`',
      '`2001:db8::/32` unmodified',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_42',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'DS-Lite B4 & AFTR Tunneling',
    category: 'theory',
    difficulty: 'exam',
    front: 'In `DS-Lite` (Dual-Stack Lite) home broadband, where does IPv4 NAT actually run?',
    back: 'The customer home CPE runs a **B4** element that encapsulates LAN IPv4 inside IPv6 (with NO IPv4 WAN address on the CPE and NO NAT on the CPE!) across the ISP IPv6 network to the ISP’s central **AFTR** Carrier-Grade NAT.',
    options: [
      'NAT runs strictly on the subscriber’s local CPE via a public IPv4 WAN IP',
      'B4 CPE encapsulates IPv4-in-IPv6 straight to the ISP’s central `AFTR` CGNAT, eliminating IPv4 WAN exhaustion on CPEs',
      'DS-Lite blocks all IPv6 connections cleanly',
      'AFTR is installed on every smartphone browser',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_43',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IGMPv3 Source-Specific Multicast (S, G)',
    category: 'theory',
    difficulty: 'core',
    front: 'What key capability did IGMPv3 add over IGMPv2 for multicast receivers?',
    back: 'IGMPv3 adds Source Filtering (`INCLUDE` / `EXCLUDE` source IP lists), enabling Source-Specific Multicast (`SSM`, `232.0.0.0/8`) where hosts subscribe directly to `(S, G)` without needing shared Rendezvous Points.',
    options: [
      'Removing multicast MAC mapping',
      'Source-Specific Multicast `(S, G)` filtering allowing hosts to specify which sources `S` to accept/reject for group `G`',
      'Switching multicast transport over TCP 80',
      'Increasing IPv4 TTL automatically to 255',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_44',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'Hierarchical Routing & Route Redistribution',
    category: 'theory',
    difficulty: 'exam',
    front: 'What danger arises when redistributing routes mutually between two routing domains (e.g., OSPF <-> RIP/EIGRP) at TWO boundary routers without tagging or filtering?',
    back: 'Sub-optimal routing and persistent Routing Loops/feedback when routes injected from Domain A into Domain B get redistributed right back into Domain A with lower administrative distance or altered metrics!',
    options: [
      'Redistribution automatically encrypts OSPF Area 0',
      'Route feedback loops & suboptimal paths if redistributed external routes loop back through a second boundary router without route-maps/tags',
      'It increases Ethernet MTU from 1500 to 9000',
      'RIP hops automatically convert to BGP AS_PATH',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_45',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'OSPF 5 Packet Types & Adjacency States',
    category: 'theory',
    difficulty: 'exam',
    front: 'In OSPFv2, match the 5 protocol packets (`Hello`, `DBD`, `LSR`, `LSU`, `LSAck`) to forming a Full adjacency:',
    back: '`Hello` discovers/maintains neighbors & DR/BDR; `DBD` exchanges LSDB header summaries (Init/ExStart/Exchange); `LSR` requests missing/newer LSAs; `LSU` sends complete LSAs (Loading); `LSAck` confirms reliable flooding.',
    options: [
      '`Hello` carries full routing tables inside broadcast Ethernet frames',
      '`Hello` checks params/DR -> `DBD` summarizes DB headers -> `LSR` asks for missing LSAs -> `LSU` delivers LSAs -> `LSAck` confirms',
      '`LSAck` opens a BGP TCP port 179 session',
      '`DBD` drops external Type 5 LSAs automatically',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_46',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'BGP Session Lifecycle Messages',
    category: 'theory',
    difficulty: 'core',
    front: 'After TCP port 179 connects between two BGP peers, which messages establish, exchange reachable prefixes, maintain liveness, and report errors?',
    back: '`OPEN` negotiates ASN/Hold Time/RouterID -> `UPDATE` advertises NLRI prefixes + path attributes or withdraws unreachable routes -> `KEEPALIVE` confirms OPEN and prevents Hold Timer expiry -> `NOTIFICATION` reports errors & closes the session.',
    options: [
      '`HELLO`, `DBD`, `LSR`, `LSU`',
      '`OPEN`, `UPDATE`, `KEEPALIVE`, and `NOTIFICATION` over TCP port 179',
      '`SOLICIT`, `ADVERTISE`, `REQUEST`, `REPLY` over UDP 546',
      '`DISCOVER`, `OFFER`, `REQUEST`, `ACK`',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_47',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'CIDR Gateway Boundaries & Broadcast Pitfalls',
    category: 'trace',
    difficulty: 'exam',
    front: 'A host is configured as IP `192.168.10.64/26` with gateway `192.168.10.62`. Why does it fail to reach the Internet cleanly?',
    back: 'A `/26` block has size 64 (`0–63`, `64–127`, `128–191`, `192–255`)! `192.168.10.64` is the NETWORK ID of the second `/26` subnet (not a usable host IP!) AND `192.168.10.62` sits in the DIFFERENT `0–63` subnet!',
    options: [
      'Nothing is wrong — `.64` and `.62` are always in the same subnet',
      'In `/26`, `.64` is the Network ID of `.64–.127` (unusable for hosts!) and gateway `.62` belongs to `.0–.63` (off-subnet)',
      'Class C masks forbid `.62` as a gateway',
      'DNS fails on even IP endings',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_48',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv4 vs IPv6 Routing Protocols (OSPFv3)',
    category: 'theory',
    difficulty: 'core',
    front: 'How does OSPFv3 support IPv6 differently from OSPFv2?',
    back: 'OSPFv3 runs directly over IPv6 using Link-Local next-hops (`fe80::...`) and decouples topology LSAs (Router/Network using Router IDs) from prefix advertisements (Intra-Area Prefix LSAs), supporting multiple address families cleanly.',
    options: [
      'OSPFv3 still requires IPv4 addresses on every interface',
      'OSPFv3 runs over IPv6 link-local addresses (`ff02::5`/`ff02::6`) and separates topology graph LSAs from IPv6 prefix LSAs',
      'OSPFv3 switches transport to TCP port 89',
      'OSPFv3 forbids Areas other than Area 0',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_49',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'IPv4 Datagram Forwarding & Checksum',
    category: 'theory',
    difficulty: 'core',
    front: 'Which fields of an IPv4 packet header are legitimately modified by an ordinary intermediate L3 router during forwarding (assuming no NAT or fragmentation)?',
    back: 'Only `TTL` (decremented by 1) and the `Header Checksum` (recomputed because TTL changed); source IP, destination IP, and DSCP/protocol stay untouched (meanwhile L2 Ethernet SRC/DST MACs are replaced at every hop!).',
    options: [
      'Source IP is rewritten to each router’s IP by default',
      'Only `TTL` and `Header Checksum` inside the IPv4 header change (plus outer L2 Ethernet Src/Dst MACs at each hop)',
      'Both Source and Destination TCP ports increment by 1',
      'The IPv4 header stays 100% bit-for-bit identical including TTL',
    ],
    correctIndex: 1,
  },
  {
    key: 'ia_50',
    courseKey: 'internet_arch',
    subjectName: 'Internet Architecture',
    conceptTitle: 'BGP Route Flap Damping & Prefix Filtering (RPKI)',
    category: 'theory',
    difficulty: 'exam',
    front: 'How does RPKI Route Origin Validation protect BGP against accidental prefix hijacking (e.g., an AS announcing someone else’s `/24`)?',
    back: 'Resource Public Key Infrastructure (RPKI) cryptographically signs Route Origin Authorizations (`ROA`) binding an IP prefix + maxLength to its authorized Origin ASN, letting BGP routers flag/drop `Invalid` hijacks.',
    options: [
      'RPKI encrypts every HTTP payload inside BGP updates',
      'Cryptographic `ROA` records verify whether the `Origin ASN` in a BGP UPDATE is authorized to announce that IP prefix',
      'RPKI switches BGP to broadcast Ethernet ARP',
      'AS_PATH prepending makes hijacking impossible automatically',
    ],
    correctIndex: 1,
  },
];

// ============================================================================
// PART B: DETERMINISTIC NUMERIC & CODE-TRACE GENERATORS (30 PER COURSE = 120)
// ============================================================================

function generateCompArchProblems() {
  const out = [];

  // B1: 10 ARM / Pipeline Trace Problems (ca_51 .. ca_60)
  const armRegsCases = [
    { regs: ['R4', 'R5', 'LR'], initialSp: '0x20001000', target: 'LR', offset: 8, newSp: '0x20000FF4' },
    { regs: ['R0', 'R1', 'R2', 'R3'], initialSp: '0x20002000', target: 'R2', offset: 8, newSp: '0x20001FF0' },
    { regs: ['R4', 'R5', 'R6', 'R7', 'LR'], initialSp: '0x20000800', target: 'R6', offset: 8, newSp: '0x200007EC' },
    { regs: ['R4', 'R5', 'R6', 'LR'], initialSp: '0x20004000', target: 'LR', offset: 12, newSp: '0x20003FF0' },
    { regs: ['R1', 'R2', 'R3', 'R4', 'R5', 'LR'], initialSp: '0x20001200', target: 'R4', offset: 12, newSp: '0x200011E8' },
  ];
  armRegsCases.forEach((c, idx) => {
    const num = 51 + idx;
    const correct = `SP = ${c.newSp}, ${c.target} at [SP, #${c.offset}]`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `SP = ${c.initialSp}, ${c.target} at [SP, #${c.offset + 4}]`,
        `SP = ${c.newSp}, ${c.target} at [SP, #${Math.max(0, c.offset - 4)}]`,
        `SP = 0x20000000, ${c.target} at [SP, #0]`,
      ],
      num * 7
    );
    out.push({
      key: `ca_${num}`,
      courseKey: 'comp_arch',
      subjectName: 'Computer Architectures',
      conceptTitle: 'ARM Full Descending Stack Trace',
      category: 'trace',
      difficulty: 'exam',
      front: `Initially SP = ${c.initialSp}. After executing \`PUSH {${c.regs.join(', ')}}\` on ARM Cortex-M3, what is the new SP and at what offset from SP is \`${c.target}\` stored?`,
      back: `${c.regs.length} words = ${c.regs.length * 4} bytes subtracted from ${c.initialSp} gives SP = ${c.newSp}. Full descending stack puts lowest register at [SP+0], placing ${c.target} at [SP, #${c.offset}].`,
      options,
      correctIndex,
    });
  });

  const armLoopCases = [
    { init: 10, step: 1, addsPerIter: 3, expectedR0: 30 },
    { init: 12, step: 2, addsPerIter: 5, expectedR0: 30 },
    { init: 8, step: 1, addsPerIter: 4, expectedR0: 32 },
    { init: 15, step: 3, addsPerIter: 7, expectedR0: 35 },
    { init: 20, step: 4, addsPerIter: 9, expectedR0: 45 },
  ];
  armLoopCases.forEach((c, idx) => {
    const num = 56 + idx;
    const iters = Math.floor(c.init / c.step);
    const correct = `R0 = ${c.expectedR0}, R1 = 0 (${iters} iterations)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `R0 = ${c.expectedR0 + c.addsPerIter}, R1 = 0 (${iters + 1} iterations)`,
        `R0 = ${c.expectedR0 - c.addsPerIter}, R1 = ${c.step} (${iters - 1} iterations)`,
        `R0 = 0, R1 = ${c.init} (infinite loop because SUB lacks S)`,
      ],
      num * 11
    );
    out.push({
      key: `ca_${num}`,
      courseKey: 'comp_arch',
      subjectName: 'Computer Architectures',
      conceptTitle: 'ARM Loop Execution Trace',
      category: 'trace',
      difficulty: 'exam',
      front: `Trace ARM Thumb-2 code:\n\`MOV R0, #0; MOV R1, #${c.init}\nloop: ADD R0, R0, #${c.addsPerIter}; SUBS R1, R1, #${c.step}; BNE loop\`\nWhat are R0 and R1 after the loop exits?`,
      back: `SUBS updates Z flag cleanly. R1 counts down by ${c.step} from ${c.init} to 0 in ${iters} iterations, accumulating R0 = ${iters} × ${c.addsPerIter} = ${c.expectedR0}.`,
      options,
      correctIndex,
    });
  });

  // B2: 10 CPU Pipeline CPI & ASE Studio Clock Problems (ca_61 .. ca_70)
  const cpiCases = [
    { baseCpi: 1.0, brFrac: 0.2, brMispred: 0.25, brPen: 2, ldFrac: 0.25, ldStallProb: 0.4, ldPen: 1 },
    { baseCpi: 1.0, brFrac: 0.15, brMispred: 0.2, brPen: 3, ldFrac: 0.3, ldStallProb: 0.5, ldPen: 1 },
    { baseCpi: 1.0, brFrac: 0.25, brMispred: 0.1, brPen: 2, ldFrac: 0.2, ldStallProb: 0.5, ldPen: 2 },
    { baseCpi: 1.2, brFrac: 0.2, brMispred: 0.15, brPen: 2, ldFrac: 0.25, ldStallProb: 0.2, ldPen: 1 },
    { baseCpi: 1.0, brFrac: 0.3, brMispred: 0.2, brPen: 3, ldFrac: 0.2, ldStallProb: 0.3, ldPen: 1 },
  ];
  cpiCases.forEach((c, idx) => {
    const num = 61 + idx;
    const brAdd = c.brFrac * c.brMispred * c.brPen;
    const ldAdd = c.ldFrac * c.ldStallProb * c.ldPen;
    const eff = (c.baseCpi + brAdd + ldAdd).toFixed(2);
    const { options, correctIndex } = pickShuffledOptions(
      `${eff}`,
      [
        `${(c.baseCpi + brAdd).toFixed(2)}`,
        `${(Number(eff) + 0.35).toFixed(2)}`,
        `${(c.baseCpi + c.brPen + c.ldPen).toFixed(2)}`,
      ],
      num * 13
    );
    out.push({
      key: `ca_${num}`,
      courseKey: 'comp_arch',
      subjectName: 'Computer Architectures',
      conceptTitle: 'Pipeline Effective CPI',
      category: 'numeric',
      difficulty: 'exam',
      front: `A processor has base CPI = ${c.baseCpi.toFixed(1)}. Branches are ${Math.round(c.brFrac * 100)}% of instructions (${Math.round(c.brMispred * 100)}% mispredicted, ${c.brPen}-cycle penalty) and Loads are ${Math.round(c.ldFrac * 100)}% (${Math.round(c.ldStallProb * 100)}% trigger a ${c.ldPen}-cycle load-use stall). Compute effective CPI:`,
      back: `CPI = ${c.baseCpi.toFixed(1)} + (${c.brFrac}*${c.brMispred}*${c.brPen}) + (${c.ldFrac}*${c.ldStallProb}*${c.ldPen}) = ${c.baseCpi.toFixed(1)} + ${brAdd.toFixed(3)} + ${ldAdd.toFixed(3)} = ${eff}.`,
      options,
      correctIndex,
    });
  });

  const aseCases = [
    { cycles: 175, freq: 1750, weight: 0.5 },
    { cycles: 525, freq: 1750, weight: 0.4 },
    { cycles: 875, freq: 1750, weight: 0.2 },
    { cycles: 350, freq: 1750, weight: 0.8 },
    { cycles: 1400, freq: 1750, weight: 0.25 },
  ];
  aseCases.forEach((c, idx) => {
    const num = 66 + idx;
    const ti = c.cycles / c.freq;
    const wt = ti * c.weight;
    const correct = `T_i = ${ti.toFixed(4)} s, weighted = ${wt.toFixed(4)} s`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `T_i = ${(ti * 2).toFixed(4)} s, weighted = ${(wt * 2).toFixed(4)} s`,
        `T_i = ${(c.freq / c.cycles).toFixed(4)} s, weighted = ${ti.toFixed(4)} s`,
        `T_i = ${wt.toFixed(4)} s, weighted = ${ti.toFixed(4)} s`,
      ],
      num * 17
    );
    out.push({
      key: `ca_${num}`,
      courseKey: 'comp_arch',
      subjectName: 'Computer Architectures',
      conceptTitle: 'ASE Studio Time Calculation',
      category: 'numeric',
      difficulty: 'lab',
      front: `In ASE Studio (Lab 01) running at f = ${c.freq} Hz, benchmark kernel k executes ${c.cycles} cycles with benchmark weight w_k = ${c.weight}. Compute T_k and weighted contribution w_k * T_k:`,
      back: `T_k = ${c.cycles} / ${c.freq} = ${ti.toFixed(4)} s; weighted = ${c.weight} * ${ti.toFixed(4)} = ${wt.toFixed(4)} s.`,
      options,
      correctIndex,
    });
  });

  // B3: 10 Amdahl's Law & Cache Tag/Index/Offset Problems (ca_71 .. ca_80)
  const amdahlCases = [
    { p: 0.8, s: 4 },
    { p: 0.5, s: 5 },
    { p: 0.75, s: 3 },
    { p: 0.9, s: 9 },
    { p: 0.4, s: 8 },
  ];
  amdahlCases.forEach((c, idx) => {
    const num = 71 + idx;
    const sp = 1 / ((1 - c.p) + c.p / c.s);
    const maxS = 1 / (1 - c.p);
    const correct = `S = ${sp.toFixed(2)}x (max bound ${maxS.toFixed(2)}x)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `S = ${(c.s * c.p).toFixed(2)}x (max bound ${c.s.toFixed(2)}x)`,
        `S = ${(sp + 0.8).toFixed(2)}x (max bound ${(maxS + 1.5).toFixed(2)}x)`,
        `S = ${(1 / (c.p / c.s)).toFixed(2)}x (unbounded)`,
      ],
      num * 19
    );
    out.push({
      key: `ca_${num}`,
      courseKey: 'comp_arch',
      subjectName: 'Computer Architectures',
      conceptTitle: 'Amdahl Law Quantitative Speedup',
      category: 'numeric',
      difficulty: 'exam',
      front: `A fraction p = ${c.p.toFixed(2)} of execution runtime is accelerated by s = ${c.s}× while the remaining ${(1 - c.p).toFixed(2)} stays unaccelerated. Compute overall Speedup S and upper bound as s -> ∞:`,
      back: `S = 1 / ((1 - ${c.p}) + ${c.p}/${c.s}) = ${sp.toFixed(2)}x; as s -> ∞, S_max = 1 / ${(1 - c.p).toFixed(2)} = ${maxS.toFixed(2)}x.`,
      options,
      correctIndex,
    });
  });

  const cacheCases = [
    { sizeKB: 32, blockB: 64, ways: 4 },
    { sizeKB: 64, blockB: 64, ways: 8 },
    { sizeKB: 16, blockB: 32, ways: 2 },
    { sizeKB: 128, blockB: 64, ways: 4 },
    { sizeKB: 8, blockB: 16, ways: 1 },
  ];
  cacheCases.forEach((c, idx) => {
    const num = 76 + idx;
    const sets = (c.sizeKB * 1024) / (c.blockB * c.ways);
    const off = Math.round(Math.log2(c.blockB));
    const index = Math.round(Math.log2(sets));
    const tag = 32 - off - index;
    const correct = `Tag = ${tag} bits, Index = ${index} bits, Offset = ${off} bits`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `Tag = ${tag - 2} bits, Index = ${index + 2} bits, Offset = ${off} bits`,
        `Tag = ${tag + 1} bits, Index = ${index} bits, Offset = ${off - 1} bits`,
        `Tag = ${tag} bits, Index = ${index + 1} bits, Offset = ${off - 1} bits`,
      ],
      num * 23
    );
    out.push({
      key: `ca_${num}`,
      courseKey: 'comp_arch',
      subjectName: 'Computer Architectures',
      conceptTitle: 'Cache Address Geometry (Tag/Index/Offset)',
      category: 'numeric',
      difficulty: 'exam',
      front: `A 32-bit byte-addressed CPU uses a ${c.sizeKB} KB, ${c.ways}-way set-associative cache with ${c.blockB}-byte blocks. Split a 32-bit address into [Tag | Index | Offset]:`,
      back: `Sets = (${c.sizeKB}×1024) / (${c.blockB}×${c.ways}) = ${sets}. Offset = log2(${c.blockB}) = ${off}b; Index = log2(${sets}) = ${index}b; Tag = 32 - ${off} - ${index} = ${tag}b.`,
      options,
      correctIndex,
    });
  });

  return out;
}

function generateDataScienceProblems() {
  const out = [];

  // B1: 10 Association Rule Support / Confidence / Lift Problems (ds_51 .. ds_60)
  const assocCases = [
    { n: 100, a: 50, b: 40, ab: 25 },
    { n: 200, a: 80, b: 100, ab: 40 },
    { n: 100, a: 25, b: 60, ab: 10 },
    { n: 50, a: 20, b: 25, ab: 15 },
    { n: 1000, a: 400, b: 500, ab: 300 },
    { n: 80, a: 40, b: 20, ab: 16 },
    { n: 100, a: 40, b: 50, ab: 20 },
    { n: 120, a: 60, b: 30, ab: 24 },
    { n: 200, a: 50, b: 40, ab: 20 },
    { n: 100, a: 50, b: 80, ab: 30 },
  ];
  assocCases.forEach((c, idx) => {
    const num = 51 + idx;
    const supp = c.ab / c.n;
    const conf = c.ab / c.a;
    const suppB = c.b / c.n;
    const lift = conf / suppB;
    const rel = Math.abs(lift - 1) < 0.001 ? 'Independent' : lift > 1 ? 'Positive corr' : 'Negative corr';
    const correct = `Supp=${supp.toFixed(2)}, Conf=${conf.toFixed(2)}, Lift=${lift.toFixed(2)} (${rel})`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `Supp=${(c.a / c.n).toFixed(2)}, Conf=${(c.ab / c.b).toFixed(2)}, Lift=${(lift + 0.5).toFixed(2)} (Positive corr)`,
        `Supp=${supp.toFixed(2)}, Conf=${suppB.toFixed(2)}, Lift=${(conf * suppB).toFixed(2)}`,
        `Supp=${(supp * 2).toFixed(2)}, Conf=${conf.toFixed(2)}, Lift=${(1 / lift).toFixed(2)}`,
      ],
      num * 29
    );
    out.push({
      key: `ds_${num}`,
      courseKey: 'data_science',
      subjectName: 'Data Science & DB Tech',
      conceptTitle: 'Association Rule Metrics Calculation',
      category: 'numeric',
      difficulty: 'exam',
      front: `Out of N = ${c.n} baskets: |A| = ${c.a}, |B| = ${c.b}, and |A ∪ B| (both A and B) = ${c.ab}. Compute Support, Confidence, and Lift of rule {A} -> {B}:`,
      back: `Supp(A,B) = ${c.ab}/${c.n} = ${supp.toFixed(2)}; Conf(A->B) = ${c.ab}/${c.a} = ${conf.toFixed(2)}; Supp(B) = ${suppB.toFixed(2)} -> Lift = ${conf.toFixed(2)}/${suppB.toFixed(2)} = ${lift.toFixed(2)} (${rel}).`,
      options,
      correctIndex,
    });
  });

  // B2: 10 Gini Impurity & Confusion Matrix (Precision/Recall/F1) Problems (ds_61 .. ds_70)
  const giniCases = [
    { pos: 6, neg: 4 },
    { pos: 5, neg: 5 },
    { pos: 9, neg: 1 },
    { pos: 8, neg: 2 },
    { pos: 3, neg: 7 },
  ];
  giniCases.forEach((c, idx) => {
    const num = 61 + idx;
    const tot = c.pos + c.neg;
    const p1 = c.pos / tot;
    const p2 = c.neg / tot;
    const gini = 1 - (p1 * p1 + p2 * p2);
    const correct = `Gini = ${gini.toFixed(2)}`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `Gini = ${(p1 * p1 + p2 * p2).toFixed(2)}`,
        `Gini = ${Math.min(p1, p2).toFixed(2)}`,
        `Gini = ${(gini / 2).toFixed(2)}`,
      ],
      num * 31
    );
    out.push({
      key: `ds_${num}`,
      courseKey: 'data_science',
      subjectName: 'Data Science & DB Tech',
      conceptTitle: 'Decision Tree Gini Calculation',
      category: 'numeric',
      difficulty: 'exam',
      front: `A binary decision tree node contains ${c.pos} positive instances and ${c.neg} negative instances (${tot} total). Compute its Gini Impurity ($1 - \\sum p_i^2$):`,
      back: `p+ = ${p1.toFixed(2)}, p- = ${p2.toFixed(2)} -> Gini = 1 - (${p1.toFixed(2)}² + ${p2.toFixed(2)}²) = ${gini.toFixed(2)}.`,
      options,
      correctIndex,
    });
  });

  const cmCases = [
    { tp: 40, fp: 10, fn: 10, tn: 140 },
    { tp: 30, fp: 20, fn: 10, tn: 40 },
    { tp: 60, fp: 20, fn: 40, tn: 80 },
    { tp: 45, fp: 5, fn: 15, tn: 135 },
    { tp: 20, fp: 20, fn: 5, tn: 155 },
  ];
  cmCases.forEach((c, idx) => {
    const num = 66 + idx;
    const prec = c.tp / (c.tp + c.fp);
    const rec = c.tp / (c.tp + c.fn);
    const f1 = (2 * prec * rec) / (prec + rec);
    const correct = `P=${prec.toFixed(2)}, R=${rec.toFixed(2)}, F1=${f1.toFixed(2)}`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `P=${rec.toFixed(2)}, R=${prec.toFixed(2)}, F1=${((prec + rec) / 2).toFixed(2)}`,
        `P=${(c.tp / (c.tp + c.tn)).toFixed(2)}, R=${prec.toFixed(2)}, F1=${rec.toFixed(2)}`,
        `P=${prec.toFixed(2)}, R=${(1 - rec).toFixed(2)}, F1=${(prec * rec).toFixed(2)}`,
      ],
      num * 37
    );
    out.push({
      key: `ds_${num}`,
      courseKey: 'data_science',
      subjectName: 'Data Science & DB Tech',
      conceptTitle: 'Confusion Matrix Metrics (P / R / F1)',
      category: 'numeric',
      difficulty: 'exam',
      front: `Given Confusion Matrix counts: TP = ${c.tp}, FP = ${c.fp}, FN = ${c.fn}, TN = ${c.tn}. Compute Precision (P), Recall (R), and F1-Score:`,
      back: `P = ${c.tp}/(${c.tp}+${c.fp}) = ${prec.toFixed(2)}; R = ${c.tp}/(${c.tp}+${c.fn}) = ${rec.toFixed(2)}; F1 = 2PR/(P+R) = ${f1.toFixed(2)}.`,
      options,
      correctIndex,
    });
  });

  // B3: 10 K-Means 1D Centroid/SSE & OLAP Sparsity Problems (ds_71 .. ds_80)
  const kmCases = [
    { c1: [2, 4], c2: [10, 12, 14] },
    { c1: [1, 3, 5], c2: [9, 11] },
    { c1: [0, 2, 4], c2: [12, 16] },
    { c1: [10, 14], c2: [20, 24, 28] },
    { c1: [3, 5, 7], c2: [15, 19] },
  ];
  kmCases.forEach((c, idx) => {
    const num = 71 + idx;
    const mu1 = c.c1.reduce((a, b) => a + b, 0) / c.c1.length;
    const mu2 = c.c2.reduce((a, b) => a + b, 0) / c.c2.length;
    const sse =
      c.c1.reduce((s, x) => s + (x - mu1) ** 2, 0) +
      c.c2.reduce((s, x) => s + (x - mu2) ** 2, 0);
    const correct = `mu1=${mu1.toFixed(1)}, mu2=${mu2.toFixed(1)}, SSE=${sse.toFixed(1)}`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `mu1=${mu1.toFixed(1)}, mu2=${mu2.toFixed(1)}, SSE=${(sse * 2).toFixed(1)}`,
        `mu1=${(mu1 + 1).toFixed(1)}, mu2=${(mu2 - 1).toFixed(1)}, SSE=${(sse + 8).toFixed(1)}`,
        `mu1=${c.c1[0].toFixed(1)}, mu2=${c.c2[0].toFixed(1)}, SSE=0.0`,
      ],
      num * 41
    );
    out.push({
      key: `ds_${num}`,
      courseKey: 'data_science',
      subjectName: 'Data Science & DB Tech',
      conceptTitle: 'K-Means Centroids & SSE Trace',
      category: 'numeric',
      difficulty: 'exam',
      front: `1D K-Means assigns points to two clusters: C1 = {${c.c1.join(', ')}} and C2 = {${c.c2.join(', ')}}. Compute the updated centroids (mu1, mu2) and total SSE:`,
      back: `mu1 = mean(C1) = ${mu1.toFixed(1)}, mu2 = mean(C2) = ${mu2.toFixed(1)}. SSE = sum(x - mu_k)^2 = ${sse.toFixed(1)}.`,
      options,
      correctIndex,
    });
  });

  const sqlCubeCases = [
    { stores: 20, products: 100, days: 365, actual: 73000 },
    { stores: 50, products: 200, days: 100, actual: 25000 },
    { stores: 10, products: 500, days: 200, actual: 50000 },
    { stores: 40, products: 250, days: 100, actual: 100000 },
    { stores: 25, products: 400, days: 100, actual: 10000 },
  ];
  sqlCubeCases.forEach((c, idx) => {
    const num = 76 + idx;
    const maxCells = c.stores * c.products * c.days;
    const densityPct = ((c.actual / maxCells) * 100).toFixed(1);
    const sparsityPct = (100 - Number(densityPct)).toFixed(1);
    const correct = `Max=${maxCells.toLocaleString()} cells (${densityPct}% full / ${sparsityPct}% sparse)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `Max=${(c.stores + c.products + c.days).toLocaleString()} cells (100.0% full / 0.0% sparse)`,
        `Max=${maxCells.toLocaleString()} cells (50.0% full / 50.0% sparse)`,
        `Max=${(maxCells / 10).toLocaleString()} cells (${sparsityPct}% full)`,
      ],
      num * 43
    );
    out.push({
      key: `ds_${num}`,
      courseKey: 'data_science',
      subjectName: 'Data Science & DB Tech',
      conceptTitle: 'Data Warehouse Cube Sparsity',
      category: 'numeric',
      difficulty: 'exam',
      front: `A Sales cube has ${c.stores} Stores × ${c.products} Products × ${c.days} Days, with ${c.actual.toLocaleString()} non-empty fact rows. What is the theoretical Cartesian cube size and Sparsity %?`,
      back: `Max cells = ${c.stores} × ${c.products} × ${c.days} = ${maxCells.toLocaleString()}. Fill density = ${c.actual}/${maxCells} = ${densityPct}% -> Sparsity = ${sparsityPct}% empty.`,
      options,
      correctIndex,
    });
  });

  return out;
}

function generateCloudProblems() {
  const out = [];

  // B1: 10 Datacenter PUE & Consolidation Problems (cc_51 .. cc_60)
  const pueCases = [
    { totalKW: 1200, itKW: 800 },
    { totalKW: 1650, itKW: 1100 },
    { totalKW: 990, itKW: 900 },
    { totalKW: 2400, itKW: 1500 },
    { totalKW: 680, itKW: 500 },
  ];
  pueCases.forEach((c, idx) => {
    const num = 51 + idx;
    const pue = (c.totalKW / c.itKW).toFixed(2);
    const overhead = c.totalKW - c.itKW;
    const correct = `PUE = ${pue}, Overhead = ${overhead} kW`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `PUE = ${(c.itKW / c.totalKW).toFixed(2)}, Overhead = ${overhead} kW`,
        `PUE = ${pue}, Overhead = ${c.itKW} kW`,
        `PUE = ${(Number(pue) + 0.5).toFixed(2)}, Overhead = ${overhead + 200} kW`,
      ],
      num * 47
    );
    out.push({
      key: `cc_${num}`,
      courseKey: 'cloud_comp',
      subjectName: 'Cloud Computing Technologies',
      conceptTitle: 'Datacenter PUE Calculation',
      category: 'numeric',
      difficulty: 'core',
      front: `A datacenter draws ${c.totalKW} kW total facility power, of which ${c.itKW} kW reaches actual IT servers/storage/networking. Compute PUE and non-IT cooling/power overhead:`,
      back: `PUE = Total Facility Power / IT Equipment Power = ${c.totalKW}/${c.itKW} = ${pue}; cooling + UPS overhead = ${c.totalKW} - ${c.itKW} = ${overhead} kW.`,
      options,
      correctIndex,
    });
  });

  const consolCases = [
    { legacyServers: 40, utilPct: 15, hostCapPct: 75 },
    { legacyServers: 50, utilPct: 12, hostCapPct: 60 },
    { legacyServers: 60, utilPct: 20, hostCapPct: 80 },
    { legacyServers: 30, utilPct: 10, hostCapPct: 75 },
    { legacyServers: 100, utilPct: 14, hostCapPct: 70 },
  ];
  consolCases.forEach((c, idx) => {
    const num = 56 + idx;
    const totalLoad = c.legacyServers * c.utilPct;
    const neededHosts = Math.ceil(totalLoad / c.hostCapPct);
    const ratio = (c.legacyServers / neededHosts).toFixed(1);
    const correct = `${neededHosts} consolidated hosts (${ratio}:1 ratio)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `${neededHosts * 2} consolidated hosts`,
        `${c.legacyServers} hosts (1:1 required for KVM)`,
        `${Math.max(1, neededHosts - 3)} hosts (${totalLoad}% load)`,
      ],
      num * 53
    );
    out.push({
      key: `cc_${num}`,
      courseKey: 'cloud_comp',
      subjectName: 'Cloud Computing Technologies',
      conceptTitle: 'VM Consolidation Sizing',
      category: 'numeric',
      difficulty: 'exam',
      front: `${c.legacyServers} legacy physical servers each average ${c.utilPct}% of a standard host’s capacity. Consolidating onto identical hosts capped at ${c.hostCapPct}% target load requires how many hosts?`,
      back: `Total demand = ${c.legacyServers} × ${c.utilPct}% = ${totalLoad}%; dividing by ${c.hostCapPct}% per host = ${neededHosts} hosts (${ratio}:1 consolidation ratio).`,
      options,
      correctIndex,
    });
  });

  // B2: 10 Linux Cgroups CPU Quota / Shares & Memory Problems (cc_61 .. cc_70)
  const quotaCases = [
    { periodUs: 100000, quotaUs: 50000 },
    { periodUs: 100000, quotaUs: 250000 },
    { periodUs: 100000, quotaUs: 150000 },
    { periodUs: 50000, quotaUs: 25000 },
    { periodUs: 100000, quotaUs: 400000 },
  ];
  quotaCases.forEach((c, idx) => {
    const num = 61 + idx;
    const cores = (c.quotaUs / c.periodUs).toFixed(2);
    const pct = Math.round((c.quotaUs / c.periodUs) * 100);
    const correct = `${cores} vCPUs (${pct}% of 1 core max, even if host is idle)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `Unlimited host cores when neighbor containers are idle`,
        `${(Number(cores) * 2).toFixed(2)} vCPUs hard floor guarantee`,
        `${c.quotaUs} vCPUs per second`,
      ],
      num * 59
    );
    out.push({
      key: `cc_${num}`,
      courseKey: 'cloud_comp',
      subjectName: 'Cloud Computing Technologies',
      conceptTitle: 'Linux Cgroups Hard CPU Quota',
      category: 'trace',
      difficulty: 'exam',
      front: `A container cgroup configures \`cpu.cfs_period_us = ${c.periodUs}\` and \`cpu.cfs_quota_us = ${c.quotaUs}\`. What effective CPU bandwidth ceiling does this impose?`,
      back: `Hard quota limits execution to quota/period = ${c.quotaUs}/${c.periodUs} = ${cores} cores (${pct}% of 1 core), throttling the cgroup cleanly every period even when other host cores sit completely idle.`,
      options,
      correctIndex,
    });
  });

  const shareCases = [
    { sA: 1024, sB: 1024, sC: 2048 },
    { sA: 512, sB: 512, sC: 1024 },
    { sA: 1024, sB: 256, sC: 768 },
    { sA: 2048, sB: 1024, sC: 1024 },
    { sA: 300, sB: 600, sC: 100 },
  ];
  shareCases.forEach((c, idx) => {
    const num = 66 + idx;
    const tot = c.sA + c.sB + c.sC;
    const pA = Math.round((c.sA / tot) * 100);
    const pB = Math.round((c.sB / tot) * 100);
    const pC = 100 - pA - pB;
    const correct = `A: ${pA}%, B: ${pB}%, C: ${pC}%`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `A: 33%, B: 33%, C: 34% regardless of shares`,
        `A: ${pC}%, B: ${pB}%, C: ${pA}%`,
        `100% exclusively to highest share group while others starve`,
      ],
      num * 61
    );
    out.push({
      key: `cc_${num}`,
      courseKey: 'cloud_comp',
      subjectName: 'Cloud Computing Technologies',
      conceptTitle: 'Cgroups CPU Shares Proportionality',
      category: 'numeric',
      difficulty: 'exam',
      front: `Three CPU-bound containers A, B, and C share 1 saturated core with \`cpu.shares\` = ${c.sA}, ${c.sB}, and ${c.sC}. Under full contention, what CPU % does each receive?`,
      back: `Total weight = ${tot}. Shares divide CPU proportionally: A=${c.sA}/${tot}=${pA}%, B=${c.sB}/${tot}=${pB}%, C=${c.sC}/${tot}=${pC}%.`,
      options,
      correctIndex,
    });
  });

  // B3: 10 EPT Page-Walk Memory Accesses & VM Live Migration Time Problems (cc_71 .. cc_80)
  const eptCases = [
    { guestLevels: 4, eptLevels: 4 },
    { guestLevels: 3, eptLevels: 4 },
    { guestLevels: 2, eptLevels: 4 },
    { guestLevels: 4, eptLevels: 3 },
    { guestLevels: 4, eptLevels: 5 },
  ];
  eptCases.forEach((c, idx) => {
    const num = 71 + idx;
    const accesses = (c.guestLevels + 1) * (c.eptLevels + 1) - 1;
    const withData = (c.guestLevels + 1) * (c.eptLevels + 1);
    const correct = `${accesses} table accesses (+1 data read = ${withData} total)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `${c.guestLevels + c.eptLevels} memory accesses total`,
        `Always 2 memory accesses regardless of page-table depth`,
        `1 memory access because EPT bypasses guest page tables`,
      ],
      num * 67
    );
    out.push({
      key: `cc_${num}`,
      courseKey: 'cloud_comp',
      subjectName: 'Cloud Computing Technologies',
      conceptTitle: 'EPT Worst-Case 2D Page Walk Cost',
      category: 'numeric',
      difficulty: 'exam',
      front: `On a complete TLB miss under nested EPT paging with a ${c.guestLevels}-level Guest Page Table and a ${c.eptLevels}-level Host EPT table, how many physical memory reads occur just to translate GVA -> HPA (before fetching data)?`,
      back: `Every one of the ${c.guestLevels} guest page-table pointers (plus final guest GPA) is itself a GPA requiring a ${c.eptLevels}-step EPT walk, costing (${c.guestLevels}+1)×(${c.eptLevels}+1) - 1 = ${accesses} table reads (${withData} total with final data fetch)! (Why large 2MB pages & huge TLBs matter!)`,
      options,
      correctIndex,
    });
  });

  const migCases = [
    { ramGB: 8, bwGbps: 1, dirtyMBs: 50 },
    { ramGB: 16, bwGbps: 10, dirtyMBs: 125 },
    { ramGB: 4, bwGbps: 1, dirtyMBs: 25 },
    { ramGB: 10, bwGbps: 2, dirtyMBs: 150 },
    { ramGB: 16, bwGbps: 1, dirtyMBs: 200 },
  ];
  migCases.forEach((c, idx) => {
    const num = 76 + idx;
    const ramMB = c.ramGB * 1000;
    const linkMBs = c.bwGbps * 125;
    if (c.dirtyMBs >= linkMBs) {
      out.push({
        key: `cc_${num}`,
        courseKey: 'cloud_comp',
        subjectName: 'Cloud Computing Technologies',
        conceptTitle: 'Pre-Copy Migration Convergence Check',
        category: 'numeric',
        difficulty: 'exam',
        front: `A ${c.ramGB} GB VM dirties memory at ${c.dirtyMBs} MB/s while Live Pre-Copy Migration runs over a ${c.bwGbps} Gbps (${linkMBs} MB/s) network. What happens to Pre-Copy rounds?`,
        back: `Because Dirty Rate (${c.dirtyMBs} MB/s) >= Link Throughput (${linkMBs} MB/s), pre-copy dirty sets never shrink! Hypervisor must throttle VM CPU (auto-converge), use compression/XBZRLE, or switch to Post-Copy/Pause.`,
        options: [
          `Diverges cleanly — Dirty Rate (${c.dirtyMBs} MB/s) >= Link BW (${linkMBs} MB/s) requires throttling or post-copy`,
          `Converges cleanly in 1.0 second with zero throttling`,
          `Doubles physical link speed to ${c.bwGbps * 2} Gbps automatically`,
          `Migration completes without copying dirty pages`,
        ],
        correctIndex: 0,
      });
    } else {
      const round1Sec = Math.round(ramMB / linkMBs);
      const r1DirtyMB = round1Sec * c.dirtyMBs;
      const correct = `Round 1 ≈ ${round1Sec}s, leaving ~${r1DirtyMB.toLocaleString()} MB dirty (converges since ${c.dirtyMBs} < ${linkMBs} MB/s)`;
      const { options, correctIndex } = pickShuffledOptions(
        correct,
        [
          `Never converges because ${c.dirtyMBs} MB/s exceeds ${linkMBs} MB/s`,
          `Round 1 ≈ 1s and zero dirty pages ever arise`,
          `Requires turning off the guest permanently before Byte 1`,
        ],
        num * 71
      );
      out.push({
        key: `cc_${num}`,
        courseKey: 'cloud_comp',
        subjectName: 'Cloud Computing Technologies',
        conceptTitle: 'Pre-Copy Live Migration Math',
        category: 'numeric',
        difficulty: 'exam',
        front: `A ${c.ramGB} GB (${ramMB.toLocaleString()} MB) VM dirties RAM at ${c.dirtyMBs} MB/s over a ${c.bwGbps} Gbps (${linkMBs} MB/s) link. Estimate Round 1 time and whether Pre-Copy converges cleanly:`,
        back: `Link rate = ${c.bwGbps} Gbps = ${linkMBs} MB/s > ${c.dirtyMBs} MB/s dirty rate -> converges cleanly! Round 1 transfers ${ramMB}/${linkMBs} = ${round1Sec} s, accumulating ~${round1Sec}×${c.dirtyMBs} = ${r1DirtyMB.toLocaleString()} MB dirty for Round 2.`,
        options,
        correctIndex,
      });
    }
  });

  return out;
}

function generateInternetProblems() {
  const out = [];

  // B1: 10 IPv4 CIDR Host Sizing, Network ID & Broadcast Problems (ia_51 .. ia_60)
  const hostSizingCases = [14, 28, 55, 120, 550, 1000, 2000, 4000, 62, 254];
  hostSizingCases.forEach((hosts, idx) => {
    const num = 51 + idx;
    const needed = hosts + 2;
    let h = 0;
    while (2 ** h < needed) h++;
    const prefix = 32 - h;
    const usable = 2 ** h - 2;
    const bits = '1'.repeat(prefix) + '0'.repeat(h);
    const mask = [0, 8, 16, 24].map((i) => parseInt(bits.slice(i, i + 8), 2)).join('.');
    const correct = `/${prefix} (${mask}, ${usable} usable hosts)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `/${Math.min(30, prefix + 1)} (${usable / 2} usable)`,
        `/${Math.max(8, prefix - 1)} (${2 ** (h + 1) - 2} usable, wastes double space)`,
        `/${Math.min(30, prefix + 2)} (insufficient hosts)`,
      ],
      num * 73
    );
    out.push({
      key: `ia_${num}`,
      courseKey: 'internet_arch',
      subjectName: 'Internet Architecture',
      conceptTitle: 'IPv4 CIDR Host-Sizing Drill',
      category: 'numeric',
      difficulty: 'lab',
      front: `What is the tightest IPv4 CIDR prefix and decimal subnet mask accommodating at least ${hosts} usable host addresses (standard network + broadcast rules)?`,
      back: `${hosts} + 2 reserved = ${needed} -> smallest power of 2 >= ${needed} is 2^${h} = ${2 ** h} -> prefix = 32 - ${h} = /${prefix} (mask ${mask}, ${usable} usable hosts).`,
      options,
      correctIndex,
    });
  });

  // B2: 10 Multicast IP->MAC Mapping & Subnet Boundary Trace Problems (ia_61 .. ia_70)
  const mcastIps = [
    '224.0.0.5',
    '224.192.16.1',
    '239.129.1.10',
    '225.128.1.1',
    '239.1.2.3',
  ];
  mcastIps.forEach((ip, idx) => {
    const num = 61 + idx;
    const octets = ip.split('.').map(Number);
    const o2 = octets[1] & 0x7f; // low 7 bits of 2nd octet -> total 7 + 8 + 8 = 23 low bits
    const hex = (v) => v.toString(16).padStart(2, '0');
    const mac = `01:00:5e:${hex(o2)}:${hex(octets[2])}:${hex(octets[3])}`;
    const wrongMac1 = `01:00:5e:${hex(octets[1])}:${hex(octets[2])}:${hex(octets[3])}`;
    const wrongMac2 = `ff:ff:ff:${hex(o2)}:${hex(octets[2])}:${hex(octets[3])}`;
    const wrongMac3 = `33:33:${hex(o2)}:${hex(octets[2])}:${hex(octets[3])}:00`;
    const { options, correctIndex } = pickShuffledOptions(
      mac,
      [
        wrongMac1 === mac ? `01:00:5e:${hex(o2 ^ 0x40)}:${hex(octets[2])}:${hex(octets[3])}` : wrongMac1,
        wrongMac2,
        wrongMac3,
      ],
      num * 79
    );
    out.push({
      key: `ia_${num}`,
      courseKey: 'internet_arch',
      subjectName: 'Internet Architecture',
      conceptTitle: 'IPv4 Multicast-to-MAC Mapping',
      category: 'trace',
      difficulty: 'exam',
      front: `Map IPv4 multicast destination \`${ip}\` onto its corresponding Ethernet Layer-2 Multicast MAC address (\`01:00:5e:xx:yy:zz\`):`,
      back: `Copy the lowest 23 bits of ${ip} (masking 2nd octet ${octets[1]} with 0x7f = ${o2} -> 0x${hex(o2)}) onto \`01:00:5e:\` -> \`${mac}\`.`,
      options,
      correctIndex,
    });
  });

  const subnetTraceCases = [
    { ip: '172.16.45.200', prefix: 26, net: '172.16.45.192', bcast: '172.16.45.255' },
    { ip: '10.10.33.75', prefix: 27, net: '10.10.33.64', bcast: '10.10.33.95' },
    { ip: '192.168.5.140', prefix: 28, net: '192.168.5.128', bcast: '192.168.5.143' },
    { ip: '192.168.12.19', prefix: 29, net: '192.168.12.16', bcast: '192.168.12.23' },
    { ip: '10.0.5.130', prefix: 25, net: '10.0.5.128', bcast: '10.0.5.255' },
  ];
  subnetTraceCases.forEach((c, idx) => {
    const num = 66 + idx;
    const block = 2 ** (32 - c.prefix);
    const correct = `Net = ${c.net}, Broadcast = ${c.bcast} (block ${block})`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `Net = 10.0.0.0, Broadcast = 255.255.255.255`,
        `Net = ${c.bcast}, Broadcast = ${c.net}`,
        `Net = ${c.ip.replace(/\.\d+$/, '.0')}, Broadcast = ${c.ip.replace(/\.\d+$/, '.255')}`,
      ],
      num * 83
    );
    out.push({
      key: `ia_${num}`,
      courseKey: 'internet_arch',
      subjectName: 'Internet Architecture',
      conceptTitle: 'Subnet Network & Broadcast Trace',
      category: 'trace',
      difficulty: 'exam',
      front: `Identify the Network ID and Directed Broadcast Address of host \`${c.ip}/${c.prefix}\`:`,
      back: `Block size in 4th octet = 2^(32-${c.prefix}) = ${block}. ${c.ip} sits inside the multiple-of-${block} range ${c.net} .. ${c.bcast}.`,
      options,
      correctIndex,
    });
  });

  // B3: 10 OSPF Link Cost & EUI-64 / IPv6 Prefix Problems (ia_71 .. ia_80)
  const ospfCostCases = [
    { refMbps: 100, bwMbps: 1000 },
    { refMbps: 10000, bwMbps: 1000 },
    { refMbps: 100000, bwMbps: 10000 },
    { refMbps: 10000, bwMbps: 100 },
    { refMbps: 100, bwMbps: 10 },
  ];
  ospfCostCases.forEach((c, idx) => {
    const num = 71 + idx;
    const cost = Math.max(1, Math.floor(c.refMbps / c.bwMbps));
    const clampedWarn = c.refMbps < c.bwMbps ? ' (clamped to 1 — why Cisco default Ref BW 100 Mbps cannot tell 1G from 10G apart!)' : '';
    const correct = `Cost = ${cost}${clampedWarn ? ' (clamped min 1)' : ''}`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `Cost = ${cost * 10}`,
        `Cost = ${Math.round(c.bwMbps / c.refMbps) || 0}`,
        `Cost = 0 (free link)`,
      ],
      num * 89
    );
    out.push({
      key: `ia_${num}`,
      courseKey: 'internet_arch',
      subjectName: 'Internet Architecture',
      conceptTitle: 'OSPF Interface Cost Calculation',
      category: 'numeric',
      difficulty: 'exam',
      front: `An OSPF router uses \`auto-cost reference-bandwidth ${c.refMbps}\` Mbps. What OSPF cost does a ${c.bwMbps >= 1000 ? `${c.bwMbps / 1000} Gbps` : `${c.bwMbps} Mbps`} interface receive?`,
      back: `OSPF Cost = max(1, floor(RefBW / InterfaceBW)) = max(1, floor(${c.refMbps} / ${c.bwMbps})) = ${cost}${clampedWarn}.`,
      options,
      correctIndex,
    });
  });

  const ipv6SubnetCases = [
    { ispPrefix: '/48', lanBits: 64 },
    { ispPrefix: '/56', lanBits: 64 },
    { ispPrefix: '/48', lanBits: 56 },
    { ispPrefix: '/52', lanBits: 64 },
    { ispPrefix: '/60', lanBits: 64 },
  ];
  ipv6SubnetCases.forEach((c, idx) => {
    const num = 76 + idx;
    const pLen = Number(c.ispPrefix.slice(1));
    const borrowed = c.lanBits - pLen;
    const subnets = 2 ** borrowed;
    const correct = `${subnets.toLocaleString()} subnets (${borrowed} Subnet ID bits)`;
    const { options, correctIndex } = pickShuffledOptions(
      correct,
      [
        `${borrowed} subnets total`,
        `${(subnets / 4).toLocaleString()} subnets`,
        `Unlimited subnets because NAT64 allocates /64 per host`,
      ],
      num * 97
    );
    out.push({
      key: `ia_${num}`,
      courseKey: 'internet_arch',
      subjectName: 'Internet Architecture',
      conceptTitle: 'IPv6 Prefix Delegation & Subnetting',
      category: 'numeric',
      difficulty: 'exam',
      front: `An organization is delegated an IPv6 \`${c.ispPrefix}\` prefix and carves it into standard \`/${c.lanBits}\` LAN/site subnets. How many distinct \`/${c.lanBits}\` subnets can it assign?`,
      back: `Subnet ID width = ${c.lanBits} - ${pLen} = ${borrowed} bits -> 2^${borrowed} = ${subnets.toLocaleString()} distinct /${c.lanBits} prefixes.`,
      options,
      correctIndex,
    });
  });

  return out;
}

export const EXTRA_UNIVERSITY_FLASHCARDS = [
  ...COMP_ARCH_CURATED,
  ...generateCompArchProblems(),
  ...DATA_SCIENCE_CURATED,
  ...generateDataScienceProblems(),
  ...CLOUD_COMP_CURATED,
  ...generateCloudProblems(),
  ...INTERNET_ARCH_CURATED,
  ...generateInternetProblems(),
];
