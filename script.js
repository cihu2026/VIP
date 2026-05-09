// 🌿 VIP 偵測助手 PRO

const keywords = [
    "公務團",
    "立委",
    "議員",
    "貴賓",
    "VIP",
    "保留",
    "專案",
    "長官",
    "公關",
    "來賓"
];

// DOM
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");

const loading = document.getElementById("loading");

const resultBox = document.getElementById("result");

const fullText = document.getElementById("fullText");

const totalCount = document.getElementById("totalCount");
const hitCount = document.getElementById("hitCount");

// 🌿 預覽圖片
imageInput.addEventListener("change", e => {

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = ev => {

        preview.src = ev.target.result;

        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
});

// 🌿 OCR掃描
async function scanImage(){

    const file = imageInput.files[0];

    if(!file){

        alert("請先選擇截圖");

        return;
    }

    loading.style.display = "block";

    resultBox.innerHTML = "";

    fullText.value = "";

    try{

        const {
            data:{ text }
        } = await Tesseract.recognize(

            file,

            'chi_tra+eng',

            {
                logger:m=>{

                    console.log(m);

                    // 可擴充進度條
                }
            }
        );

        loading.style.display = "none";

        // OCR文字
        fullText.value = text;

        analyzeText(text);

    }catch(err){

        loading.style.display = "none";

        console.error(err);

        alert("OCR辨識失敗");
    }
}

// 🌿 分析文字
function analyzeText(text){

    let foundKeywords = [];

    keywords.forEach(word=>{

        if(text.includes(word)){

            foundKeywords.push(word);
        }
    });

    // 🌿 抓時間
    const timeRegex = /\d{1,2}[:：]\d{2}/g;

    const times = text.match(timeRegex) || [];

    // 🌿 抓日期
    const dateRegex = /\d{1,2}[\/\-月]\d{1,2}/g;

    const dates = text.match(dateRegex) || [];

    // 🌿 UI輸出
    let html = "";

    html += `
        <div class="result-title">
            🔍 偵測結果
        </div>
    `;

    // 🌿 關鍵字
    html += `
        <div style="margin-bottom:14px;font-weight:800;">
            特殊關鍵字
        </div>

        <div class="keyword-wrap">
    `;

    if(foundKeywords.length > 0){

        foundKeywords.forEach(k=>{

            html += `
                <div class="keyword">
                    ${k}
                </div>
            `;
        });

    }else{

        html += `
            <div class="keyword ok">
                未發現
            </div>
        `;
    }

    html += `</div>`;

    // 🌿 時間
    html += `
        <div style="margin-top:24px;margin-bottom:14px;font-weight:800;">
            🕒 時段
        </div>

        <div class="keyword-wrap">
    `;

    if(times.length > 0){

        times.forEach(t=>{

            html += `
                <div class="keyword ok">
                    ${t}
                </div>
            `;
        });

    }else{

        html += `
            <div class="keyword ok">
                未找到
            </div>
        `;
    }

    html += `</div>`;

    // 🌿 日期
    html += `
        <div style="margin-top:24px;margin-bottom:14px;font-weight:800;">
            📅 日期
        </div>

        <div class="keyword-wrap">
    `;

    if(dates.length > 0){

        dates.forEach(d=>{

            html += `
                <div class="keyword ok">
                    ${d}
                </div>
            `;
        });

    }else{

        html += `
            <div class="keyword ok">
                未找到
            </div>
        `;
    }

    html += `</div>`;

    resultBox.innerHTML = html;

    // 🌿 統計
    totalCount.innerText = keywords.length;

    hitCount.innerText = foundKeywords.length;

    // 🌿 自動高亮
    highlightText(foundKeywords);
}

// 🌿 高亮OCR文字
function highlightText(words){

    let text = fullText.value;

    words.forEach(w=>{

        const regex = new RegExp(w,"g");

        text = text.replace(
            regex,
            `【${w}】`
        );
    });

    fullText.value = text;
}

// 🌿 拖曳上傳
document.addEventListener("dragover", e=>{

    e.preventDefault();
});

document.addEventListener("drop", e=>{

    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if(file){

        imageInput.files = e.dataTransfer.files;

        const reader = new FileReader();

        reader.onload = ev => {

            preview.src = ev.target.result;

            preview.style.display = "block";
        };

        reader.readAsDataURL(file);
    }
});

// 🌿 匯出TXT
function exportText(){

    const blob = new Blob(
        [fullText.value],
        {
            type:"text/plain"
        }
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "VIP_OCR_Result.txt";

    a.click();
}

// 🌿 清除
function clearAll(){

    imageInput.value = "";

    preview.src = "";

    preview.style.display = "none";

    resultBox.innerHTML = "";

    fullText.value = "";

    totalCount.innerText = "0";

    hitCount.innerText = "0";
}