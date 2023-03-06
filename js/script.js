'use strict'

window.addEventListener('DOMContentLoaded', async () => { 
    async function getData() {
        const response = await fetch('./json/data.json');
        const dataRawJson = await response.json();
        return dataRawJson;
    }
    let dataJson = await getData();

    function getUserInput() {
        let inputData = {};
        let inputCode = document.getElementById('input-code');
        let inputCount = document.getElementById('input-count');
        let inputQty = document.getElementById('input-qty');
        inputData.code = inputCode.value.trim();
        inputData.count = inputCount.value.trim();
        inputData.qty = inputQty.value.trim();
        return inputData;
    }

    function selectPromptElems() {
        const PROMPTS = {
            errAll : document.getElementById('err-all'),
            errCode : document.getElementById('err-code'),
            errCount : document.getElementById('err-count'),
            errUpperCase : document.getElementById('err-upper-case'),
            errLatin : document.getElementById('err-latin'),
            errQty : document.getElementById('err-qty'),
            msgCheckCode : document.getElementById('msg-check-code'),
            msgCodeOk : document.getElementById('msg-code-ok')
        };
        return PROMPTS;
    }

    function checkInputData(dataJson, inputData, PROMPTS) {
        ///Check if input is blank
        if (inputData.code === '' || inputData.count === '' || inputData.qty === '') {
            PROMPTS.errAll.style.display = 'block';
            return;
        }
        ///Count check
        if (inputData.count > 24 || isNaN(inputData.count)) {
            PROMPTS.errCount.style.display = 'block';
            return;
        }
        ///Qty checks
        if (isNaN(inputData.qty) || !(inputData.qty)) {
            PROMPTS.errQty.style.display = 'block';
            return;
        }
        ///Code checks
        const regex = /[A-Za-z]/;
        if (regex.test(inputData.code) === true) {
            PROMPTS.errLatin.style.display = 'block';
            return;
        }
        if (inputData.code.toUpperCase() !== inputData.code) {
            PROMPTS.errUpperCase.style.display = 'block';
            return;
        }
        let flag = false;
        let i = 0;
        do {
            console.log('inside for...');
            if (inputData.code === dataJson[i].Subcode) {
                flag = true;
            }
            i++;
        } while (flag === false && i < dataJson.length);
        if (flag === false) {
            PROMPTS.errCode.style.display = 'block';
            return;
        }
    }

    function buildData(dataJson, inputData) {
        let data = {};
        for (let i = 0; i < dataJson.length; i++) {
            if (inputData.code === dataJson[i].Subcode) {
                data = {
                    fullname : dataJson[i].Fullname,
                    name : dataJson[i].Name,
                    din : dataJson[i].Din,
                    material : dataJson[i].Material,
                    size: dataJson[i].Size,
                    qty : dataJson[i].Qty,
                    subcode : dataJson[i].Subcode
                };
            }
        }
        return data;
    }

    function convertGreekToLatin(data) {
        const greek_to_latin = {
            'Α':'A','Β':'B','Γ':'C','Δ':'D','Ε':'E','Ζ':'Z','Η':'H',
            'Θ':'G','Ι':'I','Κ':'K','Λ':'L','Μ':'M','Ν':'N','Ξ':'J',
            'Ο':'O','Π':'P','Ρ':'R','Σ':'S','Τ':'T','Υ':'Y','Φ':'F',
            'Χ':'X','Ψ':'U','Ω':'Q' 
        }
        const regex = new RegExp(Object.keys(greek_to_latin).join('|'), 'g');
    
        const replaceGreek = (str) => {
            return str.replace(regex, (match) => greek_to_latin[match]);
        }
    
        let codeLatin = replaceGreek(data.subcode);
        return codeLatin;
    }

    function generateLabel(data, inputData) {
        let i = 0;
        if (globalCount !== 0) {
          i = globalCount;
          inputData.count = globalCount + Number(inputData.count);
        }
    
        for (i = globalCount; i < inputData.count; i++) {
            let label = document.getElementById(`label-${i}`);

            //Generate Name
            let name = document.createElement('p');
            name.id = `name-${i}`;
            name.classList.add('name');
            label.appendChild(name);
            name.innerHTML = data.name;

            //Generate Process and Thread
            let process = document.createElement('p');
            label.appendChild(process);
            process.id = `process-${i}`;
            process.classList.add('process');
            
            //Generate Title
            let temp = '';
            Object.entries(data).forEach( ([key,value]) => {
            if ((key === 'process' && (data.process)) || (key === 'thread' && (data.thread)) || (key === 'din' && (data.din)) || (key === 'material') && (data.material)) {
                temp = temp + ' ' + value;
            }
            });
            process.innerHTML = temp;

            //Generate Size
            let size = document.createElement('p');
            label.appendChild(size);
            size.id = `size-${i}`;
            size.classList.add('size');
            size.innerHTML = data.size;

            //Generate Quantity
            let qty = document.createElement('p');
            label.appendChild(qty);
            qty.id = `qty-${i}`;
            qty.classList.add('qty');
            qty.innerHTML = inputData.qty;
            let tmx = document.createElement('span');
            tmx.classList.add('tmx');
            tmx.innerHTML = 'ΤΜΧ.';
            qty.appendChild(tmx);

            //Generate Image
            let img = document.createElement('img');
            label.appendChild(img);
            img.id = `img-${i}`;
            img.classList.add('img');
            if (data.din) {
                img.src = `./img/${data.din}.jpg`;
            } else {
                img.style.display = 'none';
            }

            //Generate Barcode
            let codeLatin = convertGreekToLatin(data);
            JsBarcode(document.getElementById(`barcode-${i}`), codeLatin, {
                format: "CODE128",
                displayValue: false,
                fontSize: 20,
                height: 40,
                margin: 0,
                textMargin: 5,
                textAlign: "center",
                textPosition: "bottom",
                width: 1.6,
                background: "#ffffff",
                lineColor: "#000000",
                fontOptions: "bold"
            });
        }
        globalCount = Number(inputData.count);
    }

    let PROMPTS = selectPromptElems();
    let globalCount = 0;

    let buttonCreate = document.getElementById('button-create');
    buttonCreate.addEventListener('click', () => {
        Object.entries(PROMPTS).forEach(([key,value])=>{
            value.style.display = 'none';
        });
        let inputData = getUserInput();
        checkInputData(dataJson, inputData, PROMPTS);
        let data = buildData(dataJson, inputData);
        generateLabel(data, inputData);

        ///CLEAR INPUT FIELDS///
        document.getElementById('input-code').value = '';
        document.getElementById('input-count').value = '';
        document.getElementById('input-qty').value = '';
    });
    let buttonPdf = document.getElementById('button-save');
    buttonPdf.addEventListener('click', function () {
      var element = document.getElementById('label-container');
      html2pdf()
        .set({
          margin: 0,
          filename: 'labels.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { dpi: 192, scale: 4, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
    });     
});


