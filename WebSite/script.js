function logResult(elementId, text) {
    document.getElementById(elementId).innerHTML = text;
}

function setStatus(text) {
    document.getElementById('status').innerText = text;
}

// Il campione di test da 32 bit conigui in memoria come richiesto da ONNX Runtime e Treelite.
const sampleInput = Float32Array.from([12.0, 0.0, 1.0, 0.0, 0.0, 0.0]);
const iterations = 1000;

// ---------------------------------------------------------
// TEST ONNX
// ---------------------------------------------------------
async function benchmarkONNX(providerName, elementId) {
    try {
        logResult(elementId, `Inizializzazione ${providerName.toUpperCase()}...`);
        
        // 1. TEMPO DI CARICAMENTO
        const startLoad = performance.now();
        const session = await ort.InferenceSession.create('./xgb_model_ott.onnx', {
            executionProviders: [providerName]
        });
        const endLoad = performance.now();
        const loadTime = endLoad - startLoad;

        // Preparo l'input tensoriale. ONNX Runtime richiede che i dati siano in un formato specifico (Tensor),
        // cioè un array di tipo Float32Array formato da una riga e sei colonne.
        const tensorInput = new ort.Tensor('float32', sampleInput, [1, 6]);
        const feeds = { float_input: tensorInput };

        // 2. WARM-UP I motori ML spesso inizializzano la memoria in ritardo (lazy initialization). Se non facessi il warm-up,
        //  la prima iterazione risulterebbe lentissima, sballando la media.
        await session.run(feeds);

        // 3. MISURAZIONE LATENZA E THROUGHPUT
        logResult(elementId, `Esecuzione di ${iterations} iterazioni...`);
        
        const startInference = performance.now();
        for (let i = 0; i < iterations; i++) {
            await session.run(feeds);
        }
        const endInference = performance.now();
        
        const totalTime = endInference - startInference;
        const avgLatenza = totalTime / iterations;
        const throughput = 1000 / avgLatenza;

        // 4. REPORT
        const report = `
Test Completato con Successo.
-----------------------------------
File analizzato  : xgb_model_ott.onnx
Provider         : ${providerName.toUpperCase()}
Tempo Caricamento: ${loadTime.toFixed(2)} ms
Latenza Media    : ${avgLatenza.toFixed(4)} ms
Throughput       : ${throughput.toFixed(2)} inf/sec
Tempo Totale     : ${totalTime.toFixed(2)} ms
-----------------------------------
`;
        logResult(elementId, report);

    } catch (error) {
        logResult(elementId, `<span style="color:red">Errore durante il test ${providerName}: ${error.message}</span>`);
        return null;
    }
}

// ---------------------------------------------------------
// TEST TREELITE
// ---------------------------------------------------------
async function benchmarkTreelite(elementId) {
    try {
        logResult(elementId, `Inizializzazione Treelite WASM...`);
        
        // 1. ATTESA CARICAMENTO MODULO
        const startLoad = performance.now();
        const treeliteModule = await createTreeliteModule();
        const endLoad = performance.now();
        const loadTime = endLoad - startLoad;

        // 2. PREPARAZIONE MEMORIA
        const bytesPerFloat = 4;
        const pointerInput = treeliteModule._malloc(sampleInput.length * bytesPerFloat);
        
        for (let i = 0; i < sampleInput.length; i++) {
            treeliteModule.setValue(pointerInput + (i * bytesPerFloat), sampleInput[i], 'float');
        }

        // Warm-up
        if (typeof treeliteModule._predict !== 'function') {
            throw new Error("Funzione C '_predict' non trovata. Controlla il file header.h!");
        }
        treeliteModule._predict(pointerInput);

        // 3. MISURAZIONE LATENZA
        logResult(elementId, `Esecuzione di ${iterations} iterazioni...`);
        
        const startInference = performance.now();
        for (let i = 0; i < iterations; i++) {
            treeliteModule._predict(pointerInput);
        }
        const endInference = performance.now();

        treeliteModule._free(pointerInput);

        // 4. CALCOLO E REPORT
        const totalTime = endInference - startInference;
        const avgLatenza = totalTime / iterations;
        const throughput = 1000 / avgLatenza;

        const report = `
Test Completato con Successo.
-----------------------------------
File analizzato  : public/model.wasm
Tempo Caricamento: ${loadTime.toFixed(2)} ms
Latenza Media    : ${avgLatenza.toFixed(4)} ms
Throughput       : ${throughput.toFixed(2)} inf/sec
Tempo Totale     : ${totalTime.toFixed(2)} ms
-----------------------------------
`;
        logResult(elementId, report);

    } catch (error) {
        logResult(elementId, `<span style="color:red">Errore Treelite: ${error.message}</span>`);
        console.error(error);
    }
}
// ---------------------------------------------------------
// MOTORE DI ESECUZIONE
// ---------------------------------------------------------
async function runAllBenchmarks() {
    const btn = document.getElementById('runTestsBtn');
    btn.disabled = true;
    setStatus("Esecuzione test in corso. Attendi...");

    // Test 1: CPU (WebAssembly)
    await benchmarkONNX('wasm', 'res-wasm');
    
    await new Promise(r => setTimeout(r, 500));

    // Test 2: GPU (WebGPU)
    await benchmarkONNX('webgpu', 'res-webgpu');

    await new Promise(r => setTimeout(r, 500));

    // Test 3: Treelite
    await benchmarkTreelite('res-treelite');

    setStatus("Test completati.");
    btn.disabled = false;
}