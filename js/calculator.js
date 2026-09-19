/**
 * United SSD Chem - Interactive Chemical Dilution & Industrial Packaging Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  const calcTabs = document.querySelectorAll('.calc-tab-btn');
  const calcPanels = document.querySelectorAll('.calc-panel');

  calcTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      calcTabs.forEach((t) => t.classList.remove('active'));
      calcPanels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(tab.getAttribute('data-target'));
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // --- TOOL 1: DILUTION CALCULATOR (C1 * V1 = C2 * V2) ---
  const c1Input = document.getElementById('c1Input');
  const c2Input = document.getElementById('c2Input');
  const v2Input = document.getElementById('v2Input');
  const v2Unit = document.getElementById('v2Unit');

  const v1Result = document.getElementById('v1Result');
  const solventResult = document.getElementById('solventResult');
  const ratioResult = document.getElementById('ratioResult');
  const dilutionAlert = document.getElementById('dilutionAlert');

  function calculateDilution() {
    const c1 = parseFloat(c1Input?.value);
    const c2 = parseFloat(c2Input?.value);
    const v2 = parseFloat(v2Input?.value);
    const unit = v2Unit?.value || 'L';

    if (!c1 || !c2 || !v2 || c1 <= 0 || c2 <= 0 || v2 <= 0) {
      if (v1Result) v1Result.textContent = '--';
      if (solventResult) solventResult.textContent = '--';
      if (ratioResult) ratioResult.textContent = '--';
      if (dilutionAlert) dilutionAlert.style.display = 'none';
      return;
    }

    if (c2 > c1) {
      if (dilutionAlert) {
        dilutionAlert.textContent = 'Target concentration (C₂) cannot exceed stock concentration (C₁).';
        dilutionAlert.style.display = 'block';
      }
      if (v1Result) v1Result.textContent = 'Invalid';
      if (solventResult) solventResult.textContent = 'Invalid';
      if (ratioResult) ratioResult.textContent = 'N/A';
      return;
    }

    if (dilutionAlert) dilutionAlert.style.display = 'none';

    // V1 = (C2 * V2) / C1
    const v1 = (c2 * v2) / c1;
    const solvent = v2 - v1;
    const ratio = (solvent / v1).toFixed(2);

    if (v1Result) v1Result.textContent = `${v1.toFixed(2)} ${unit}`;
    if (solventResult) solventResult.textContent = `${solvent.toFixed(2)} ${unit}`;
    if (ratioResult) ratioResult.textContent = `1 : ${ratio} (Stock : Solvent)`;
  }

  [c1Input, c2Input, v2Input, v2Unit].forEach((elem) => {
    if (elem) elem.addEventListener('input', calculateDilution);
  });

  // --- TOOL 2: PACKAGING & FREIGHT ESTIMATOR ---
  const volumeInput = document.getElementById('batchVolumeInput');
  const productSelect = document.getElementById('calcProductSelect');
  const densityInput = document.getElementById('calcDensityInput');

  const ibcResult = document.getElementById('ibcResult');
  const drumResult = document.getElementById('drumResult');
  const canisterResult = document.getElementById('canisterResult');
  const weightKgResult = document.getElementById('weightKgResult');
  const palletResult = document.getElementById('palletResult');
  const btnApplyToQuote = document.getElementById('btnApplyToQuote');

  // Populate chemical select dropdown if products available
  if (productSelect && window.chemicalProducts) {
    productSelect.innerHTML = '<option value="custom" data-density="1.10">-- Custom Chemical / Default (1.10 g/cm³) --</option>';
    window.chemicalProducts.forEach((prod) => {
      const densityVal = parseFloat(prod.density) || 1.10;
      const opt = document.createElement('option');
      opt.value = prod.name;
      opt.dataset.density = densityVal;
      opt.textContent = `${prod.name} (Purity: ${prod.purity})`;
      productSelect.appendChild(opt);
    });

    productSelect.addEventListener('change', () => {
      const selected = productSelect.options[productSelect.selectedIndex];
      if (selected && selected.dataset.density) {
        if (densityInput) densityInput.value = selected.dataset.density;
        calculatePackaging();
      }
    });
  }

  function calculatePackaging() {
    const totalVolumeLiters = parseFloat(volumeInput?.value) || 0;
    const density = parseFloat(densityInput?.value) || 1.10;

    if (totalVolumeLiters <= 0) {
      if (ibcResult) ibcResult.textContent = '0';
      if (drumResult) drumResult.textContent = '0';
      if (canisterResult) canisterResult.textContent = '0';
      if (weightKgResult) weightKgResult.textContent = '0.00 kg';
      if (palletResult) palletResult.textContent = '0 pallets';
      return;
    }

    // Recommended package breakdown:
    // Try to pack into 1000L IBCs first, then 200L drums, then 25L canisters
    let remaining = totalVolumeLiters;
    const ibcCount = Math.floor(remaining / 1000);
    remaining %= 1000;

    const drumCount = Math.floor(remaining / 200);
    remaining %= 200;

    const canisterCount = Math.ceil(remaining / 25);

    // Total gross weight
    const netWeightKg = totalVolumeLiters * density;
    const tareWeightKg = ibcCount * 60 + drumCount * 18 + canisterCount * 1.5;
    const grossWeightKg = (netWeightKg + tareWeightKg).toFixed(1);

    // Pallet space: 1 IBC = 1 pallet; 4 drums = 1 pallet; 32 canisters = 1 pallet
    const palletsNeeded = Math.ceil(ibcCount + drumCount / 4 + canisterCount / 32) || 1;

    if (ibcResult) ibcResult.textContent = ibcCount.toString();
    if (drumResult) drumResult.textContent = drumCount.toString();
    if (canisterResult) canisterResult.textContent = canisterCount.toString();
    if (weightKgResult) weightKgResult.textContent = `${grossWeightKg} kg (~${(grossWeightKg * 2.20462).toFixed(1)} lbs)`;
    if (palletResult) palletResult.textContent = `${palletsNeeded} Standard Pallet${palletsNeeded > 1 ? 's' : ''}`;
  }

  [volumeInput, densityInput].forEach((elem) => {
    if (elem) elem.addEventListener('input', calculatePackaging);
  });

  // Apply to Quote button
  if (btnApplyToQuote) {
    btnApplyToQuote.addEventListener('click', () => {
      const vol = volumeInput?.value;
      const selectedProd = productSelect?.value !== 'custom' ? productSelect?.value : '';

      const quoteProductInput = document.getElementById('rfqProduct');
      const quoteVolumeInput = document.getElementById('rfqVolume');
      const quoteNotesInput = document.getElementById('rfqNotes');

      if (quoteProductInput && selectedProd) {
        quoteProductInput.value = selectedProd;
      }
      if (quoteVolumeInput && vol) {
        quoteVolumeInput.value = `${vol} Litres`;
      }
      if (quoteNotesInput) {
        quoteNotesInput.value = `Calculated Packaging: ${ibcResult?.textContent || 0}x 1000L IBC, ${drumResult?.textContent || 0}x 200L Drum, ${canisterResult?.textContent || 0}x 25L Canister. Est. Gross Weight: ${weightKgResult?.textContent || ''}`;
      }

      // Smooth scroll to RFQ section
      const rfqSection = document.getElementById('rfq');
      if (rfqSection) {
        rfqSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initial calculation runs
  calculateDilution();
  calculatePackaging();
});
