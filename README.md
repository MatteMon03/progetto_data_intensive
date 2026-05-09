## Struttura del Progetto

Il repository è diviso in ambienti logici: addestramento (Python), compilazione (C/C++) ed esecuzione client (Web).

```text
ROOT
│
├── .venv/                  # Ambiente virtuale Python (ignorato su Git)
├── archive/                # Backup e vecchi script di test
├── emsdk/                  # Toolchain Emscripten per la compilazione WASM (ignorato su Git)
│
├── model_c_src/            # Codice sorgente C puro generato da tl2cgen (ignorato su Git)
│
|
│
├── WebSite/                # L'interfaccia utente web per il benchmark
|   ├── public/                 # Artefatti WebAssembly compilati pronti per l'uso (ignorato su Git)
│   |    ├── model.js               # Codice generato da Emscripten
│   |    └── model.wasm             # Binario del modello ottimizzato per il web
│   ├── index.html             # Pagina principale del sito
│   ├── script.js              # Motore JS che esegue i test e misura la latenza dei modelli web
│   └── xgb_model_ott.onnx     # Modello esportato in formato ONNX per i test concorrenti (ignorato su Git)
│
├── compile.sh                 # Script Bash per automatizzare la compilazione C -> WASM
├── requirements.txt           # Dipendenze Python necessarie per l'addestramento
├── training.ipynb             # Notebook Jupyter con training, ottimizzazione e test Python
├── benchmark_evaluation.csv   # Risultati aggregati dei test eseguiti in Python (ignorato su Git)
└── xgb_model_ott.json / .so   # Modelli XGBoost/Treelite esportati in locale (ignorato su Git)
```
