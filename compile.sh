#!/bin/bash

# ==============================================================================
# Script di Compilazione: Da C (Treelite/tl2cgen) a WebAssembly (WASM)
# ==============================================================================

echo "Avvio della compilazione WebAssembly..."

# 1. Attivazione automatica dell'ambiente Emscripten
if [ -d "emsdk" ]; then
    echo "Attivazione ambiente Emscripten..."
    cd emsdk
    source ./emsdk_env.sh > /dev/null 2>&1
    cd ..
else
    echo "Errore: Cartella 'emsdk' non trovata."
    exit 1
fi

# 2. Creazione della cartella di destinazione
mkdir -p ./WebSite/public

# 3. Esecuzione della compilazione
echo "Compilazione in corso..."
emcc ./model_c_src/*.c \
    -O3 \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_malloc", "_free", "_predict"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "setValue"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createTreeliteModule" \
    -o ./WebSite/public/model.js

# 4. Verifica dell'esito
if [ $? -eq 0 ]; then
    echo "Compilazione completata"
    echo "I file model.js e model.wasm sono stati salvati in ./WebSite/public/"
else
    echo "Errore durante la compilazione."
    exit 1
fi