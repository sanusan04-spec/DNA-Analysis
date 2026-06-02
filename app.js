const demoSequence = `>BRCA1_exon_learning_sample
ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGATATAACCAAAAGGAGCCTACAAGAAAGTACGAGATTTAGTCAACTTGTTGAAGAGCTATTGAAAATCATTTGTGCTTTTCAGCTTGACACAGGTTTGGAGTATGCAAACAGCTATAATTTTGCAAAAAAGGAAAATAACTCTCCTGAACATCTAAAAGATGAAGTTTCTATCATCCAAAGTATGGGCTACAGAAACCGTGCCAAAAGACTTCTACAGAGTGAACCCGAAAATCCTTCCTTGCAGGAAACCAGTCTCAGTGTCCAACTCTCTAACCTTGGAACTGTGAGAACTCTGAGGACAAAGCAGCGGATACAACCTCAAAAGACGTCTGTCTACATTGAATTGGGATCTGATTCTTCTGAAGATACCGTTAATAAGGCAACTTATTGCAGTGTGGGAGATCAAGAATTGTTACAAATCACCCCTCAAGGAACCAGGGATGAAATCAGTTTGGATTCTGCAAAAAAGGCTGCTTGTGAATTTTCTGAGACGGATGTAACAAATACTGAACATCATCAACCCAGTAATAATGATTTGAACACCACTGAGAAGCGTGCAGCTGAGAGGCATCCAGAAAAGTATCAGGGTAGTTCTGTTTCAAACTTGCATGTGGAGCCATGTGGCACAAATACTCATGCCAGCTCATTACAGCATGAGAACAGCAGTTTATTACTCACTAA`;

const expressionData = [
  { gene: "TP53", normal: 35, tumor: 92, role: "Genome guardian often altered in cancer" },
  { gene: "BRCA1", normal: 64, tumor: 28, role: "DNA repair gene linked to breast and ovarian cancer risk" },
  { gene: "EGFR", normal: 42, tumor: 104, role: "Growth signaling receptor and oncology drug target" },
  { gene: "MYC", normal: 51, tumor: 121, role: "Transcription factor associated with proliferation" },
  { gene: "PTEN", normal: 76, tumor: 31, role: "Tumor suppressor in PI3K pathway regulation" },
  { gene: "VEGFA", normal: 44, tumor: 86, role: "Angiogenesis marker relevant to tumor vascularization" }
];

const codonTable = {
  TTT: "F", TTC: "F", TTA: "L", TTG: "L", TCT: "S", TCC: "S", TCA: "S", TCG: "S",
  TAT: "Y", TAC: "Y", TAA: "*", TAG: "*", TGT: "C", TGC: "C", TGA: "*", TGG: "W",
  CTT: "L", CTC: "L", CTA: "L", CTG: "L", CCT: "P", CCC: "P", CCA: "P", CCG: "P",
  CAT: "H", CAC: "H", CAA: "Q", CAG: "Q", CGT: "R", CGC: "R", CGA: "R", CGG: "R",
  ATT: "I", ATC: "I", ATA: "I", ATG: "M", ACT: "T", ACC: "T", ACA: "T", ACG: "T",
  AAT: "N", AAC: "N", AAA: "K", AAG: "K", AGT: "S", AGC: "S", AGA: "R", AGG: "R",
  GTT: "V", GTC: "V", GTA: "V", GTG: "V", GCT: "A", GCC: "A", GCA: "A", GCG: "A",
  GAT: "D", GAC: "D", GAA: "E", GAG: "E", GGT: "G", GGC: "G", GGA: "G", GGG: "G"
};

let currentAnalysis = analyzeSequence(demoSequence);

const elements = {
  sequenceInput: document.querySelector("#sequenceInput"),
  sequenceForm: document.querySelector("#sequenceForm"),
  sampleSequence: document.querySelector("#sampleSequence"),
  loadDemo: document.querySelector("#loadDemo"),
  clearAll: document.querySelector("#clearAll"),
  seqLength: document.querySelector("#seqLength"),
  gcContent: document.querySelector("#gcContent"),
  longestOrf: document.querySelector("#longestOrf"),
  cpgRatio: document.querySelector("#cpgRatio"),
  qualityFlag: document.querySelector("#qualityFlag"),
  compositionChart: document.querySelector("#compositionChart"),
  helixCanvas: document.querySelector("#helixCanvas"),
  orfList: document.querySelector("#orfList"),
  variantForm: document.querySelector("#variantForm"),
  variantPosition: document.querySelector("#variantPosition"),
  variantBase: document.querySelector("#variantBase"),
  variantResult: document.querySelector("#variantResult"),
  expressionTable: document.querySelector("#expressionTable"),
  heatmap: document.querySelector("#heatmap")
};

function cleanSequence(input) {
  return input
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join("")
    .toUpperCase()
    .replace(/[^ACGT]/g, "");
}

function analyzeSequence(input) {
  const sequence = cleanSequence(input);
  const counts = { A: 0, C: 0, G: 0, T: 0 };
  for (const base of sequence) counts[base] += 1;
  const length = sequence.length;
  const gc = length ? ((counts.G + counts.C) / length) * 100 : 0;
  const cpg = (sequence.match(/CG/g) || []).length;
  const expectedCpg = length ? (counts.C * counts.G) / length : 0;
  const cpgRatio = expectedCpg ? cpg / expectedCpg : 0;
  const orfs = findOrfs(sequence);
  return { sequence, counts, length, gc, cpgRatio, orfs };
}

function findOrfs(sequence) {
  const stops = new Set(["TAA", "TAG", "TGA"]);
  const orfs = [];
  for (let frame = 0; frame < 3; frame += 1) {
    for (let i = frame; i <= sequence.length - 3; i += 3) {
      if (sequence.slice(i, i + 3) !== "ATG") continue;
      for (let j = i + 3; j <= sequence.length - 3; j += 3) {
        const codon = sequence.slice(j, j + 3);
        if (stops.has(codon)) {
          const dna = sequence.slice(i, j + 3);
          orfs.push({
            frame: frame + 1,
            start: i + 1,
            end: j + 3,
            codons: dna.length / 3,
            protein: translate(dna).replace("*", "")
          });
          break;
        }
      }
    }
  }
  return orfs.sort((a, b) => b.codons - a.codons).slice(0, 6);
}

function translate(sequence) {
  let protein = "";
  for (let i = 0; i <= sequence.length - 3; i += 3) {
    protein += codonTable[sequence.slice(i, i + 3)] || "X";
  }
  return protein;
}

function updateSequenceUI(analysis) {
  elements.seqLength.textContent = `${analysis.length.toLocaleString()} bp`;
  elements.gcContent.textContent = `${analysis.gc.toFixed(1)}%`;
  elements.longestOrf.textContent = analysis.orfs[0] ? `${analysis.orfs[0].protein.length} aa` : "0 aa";
  elements.cpgRatio.textContent = analysis.cpgRatio.toFixed(2);
  elements.qualityFlag.textContent = getQualityFlag(analysis);
  drawCompositionChart(analysis.counts);
  renderOrfs(analysis.orfs);
}

function getQualityFlag({ length, gc }) {
  if (!length) return "Waiting for input";
  if (length < 90) return "Short sequence: interpret carefully";
  if (gc < 35) return "AT-rich region";
  if (gc > 65) return "GC-rich region";
  return "Balanced composition";
}

function drawCompositionChart(counts) {
  const canvas = elements.compositionChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const labels = Object.keys(counts);
  const colors = { A: "#0f766e", C: "#5b5f97", G: "#be3455", T: "#b7791f" };
  const max = Math.max(1, ...Object.values(counts));
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfdfc";
  ctx.fillRect(0, 0, width, height);
  labels.forEach((label, index) => {
    const barWidth = 86;
    const x = 64 + index * 135;
    const barHeight = (counts[label] / max) * 190;
    ctx.fillStyle = colors[label];
    ctx.fillRect(x, height - 54 - barHeight, barWidth, barHeight);
    ctx.fillStyle = "#17211f";
    ctx.font = "700 18px system-ui";
    ctx.fillText(label, x + 33, height - 22);
    ctx.font = "600 14px system-ui";
    ctx.fillText(String(counts[label]), x + 28, height - 64 - barHeight);
  });
}

function renderOrfs(orfs) {
  if (!orfs.length) {
    elements.orfList.className = "list empty";
    elements.orfList.textContent = "No complete start-to-stop ORFs found.";
    return;
  }
  elements.orfList.className = "list";
  elements.orfList.innerHTML = orfs.map((orf) => `
    <article class="orf-item">
      <strong>Frame ${orf.frame}: ${orf.start}-${orf.end} (${orf.protein.length} aa)</strong>
      <span>${orf.codons} codons from ATG to stop codon</span>
      <code>${orf.protein.slice(0, 90)}${orf.protein.length > 90 ? "..." : ""}</code>
    </article>
  `).join("");
}

function interpretVariant(position, alternateBase) {
  const sequence = currentAnalysis.sequence;
  if (!sequence.length) return { title: "No sequence available", text: "Add or load a sequence first.", pills: [] };
  if (position < 1 || position > sequence.length) {
    return { title: "Position out of range", text: `Choose a position from 1 to ${sequence.length}.`, pills: [] };
  }
  const index = position - 1;
  const referenceBase = sequence[index];
  if (referenceBase === alternateBase) {
    return { title: "No nucleotide change", text: "The alternate base matches the reference base at this position.", pills: [`Reference ${referenceBase}`, "No effect"] };
  }
  const codonStart = Math.floor(index / 3) * 3;
  const refCodon = sequence.slice(codonStart, codonStart + 3);
  if (refCodon.length < 3) {
    return { title: "Incomplete codon", text: "This position falls at the end of a partial codon.", pills: [`Reference ${referenceBase}`, `Alt ${alternateBase}`] };
  }
  const altCodon = refCodon.split("");
  altCodon[index - codonStart] = alternateBase;
  const altCodonText = altCodon.join("");
  const refAa = translate(refCodon);
  const altAa = translate(altCodonText);
  let effect = "Missense";
  let explanation = "The mutation changes the amino acid. Researchers would next check conservation, protein domain context, population frequency, and clinical databases.";
  if (refAa === altAa) {
    effect = "Silent";
    explanation = "The codon changed but the amino acid stayed the same. Silent variants can still matter if they affect splicing, regulation, or translation efficiency.";
  } else if (altAa === "*") {
    effect = "Nonsense";
    explanation = "The mutation creates an early stop signal. In real pipelines this is often prioritized because it may truncate a protein.";
  } else if (refAa === "*") {
    effect = "Stop-loss";
    explanation = "The mutation removes a stop codon. This can extend a protein and deserves follow-up annotation.";
  }
  return {
    title: `${effect} variant`,
    text: explanation,
    pills: [
      `Position ${position}`,
      `${referenceBase} > ${alternateBase}`,
      `${refCodon} (${refAa}) > ${altCodonText} (${altAa})`
    ]
  };
}

function renderVariant(result) {
  elements.variantResult.innerHTML = `
    <h3>${result.title}</h3>
    <div class="pill-row">${result.pills.map((pill) => `<span class="pill">${pill}</span>`).join("")}</div>
    <p>${result.text}</p>
  `;
}

function renderExpression() {
  elements.expressionTable.innerHTML = expressionData.map((row) => {
    const log2fc = Math.log2((row.tumor + 1) / (row.normal + 1));
    const signal = log2fc > 0.7 ? "Up" : log2fc < -0.7 ? "Down" : "Steady";
    return `
      <tr title="${row.role}">
        <td><strong>${row.gene}</strong></td>
        <td>${row.normal}</td>
        <td>${row.tumor}</td>
        <td>${log2fc.toFixed(2)}</td>
        <td><span class="badge ${signal.toLowerCase()}">${signal}</span></td>
      </tr>
    `;
  }).join("");

  const maxValue = Math.max(...expressionData.flatMap((row) => [row.normal, row.tumor]));
  elements.heatmap.innerHTML = expressionData.map((row) => `
    <div class="heat-row">
      <strong>${row.gene}</strong>
      ${heatCell("Normal", row.normal, maxValue)}
      ${heatCell("Tumor", row.tumor, maxValue)}
    </div>
  `).join("");
}

function heatCell(label, value, maxValue) {
  const intensity = Math.max(0.18, value / maxValue);
  const hue = label === "Tumor" ? "344" : "176";
  return `<span class="heat-cell" style="background: hsl(${hue} 58% ${62 - intensity * 28}%);">${label}: ${value}</span>`;
}

function drawHelix(time = 0) {
  const canvas = elements.helixCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#10211f";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  for (let x = 30; x < width; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let i = 0; i < 34; i += 1) {
    const y = 22 + i * 12;
    const phase = i * 0.45 + time * 0.002;
    const x1 = width / 2 + Math.sin(phase) * 165;
    const x2 = width / 2 + Math.sin(phase + Math.PI) * 165;
    const front = Math.cos(phase) > 0;
    ctx.strokeStyle = front ? "rgba(125, 211, 202, 0.92)" : "rgba(247, 183, 49, 0.7)";
    ctx.lineWidth = front ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.fillStyle = front ? "#7dd3ca" : "#f7b731";
    ctx.beginPath();
    ctx.arc(x1, y, front ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = front ? "#f7b731" : "#7dd3ca";
    ctx.beginPath();
    ctx.arc(x2, y, front ? 5 : 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = "700 20px system-ui";
  ctx.fillText("A C G T", 34, 46);
  ctx.font = "600 14px system-ui";
  ctx.fillText("from sequence to research insight", 34, 72);
  requestAnimationFrame(drawHelix);
}

function loadDemo() {
  elements.sequenceInput.value = demoSequence;
  currentAnalysis = analyzeSequence(demoSequence);
  updateSequenceUI(currentAnalysis);
  renderVariant(interpretVariant(Number(elements.variantPosition.value), elements.variantBase.value));
}

elements.sequenceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  currentAnalysis = analyzeSequence(elements.sequenceInput.value);
  updateSequenceUI(currentAnalysis);
  renderVariant({ title: "Sequence analyzed", text: "Now choose a position and alternate base to inspect a mutation.", pills: [`${currentAnalysis.length} bp`] });
});

elements.sampleSequence.addEventListener("click", loadDemo);
elements.loadDemo.addEventListener("click", loadDemo);
elements.clearAll.addEventListener("click", () => {
  elements.sequenceInput.value = "";
  currentAnalysis = analyzeSequence("");
  updateSequenceUI(currentAnalysis);
  renderVariant({ title: "Workspace reset", text: "Load a demo or paste your own DNA sequence to begin.", pills: [] });
});

elements.variantForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderVariant(interpretVariant(Number(elements.variantPosition.value), elements.variantBase.value));
});

loadDemo();
renderExpression();
drawHelix();
