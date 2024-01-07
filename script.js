// script.js

var myChart;

class Player {
    constructor(args) {
        this.name = args[0]; // プレイヤー名
        this.investment = args[1]; // 投資金額(円)
        this.replay = args[2]; // 再プレイ(枚)
        this.recovery = args[3]; // 回収金額(円)
        this.deposit = args[4]; // 貯メダル(枚)

        // 交換率
        var exchangeRate = parseFloat($("#exchangeRate").val());

        // メダル１枚の価値（円）
        // ( 100 / exchangeRate ) を小数２点第３位を四捨五入している。
        var medalValue = Math.round(100 * 100 / exchangeRate) / 100;

        // 再プレイ(枚)の円換算
        this.replayYen = this.replay * medalValue;

        // 貯メダル(枚)の円換算
        this.depositYen = this.deposit * medalValue;

        // 個人収支(円)
        this.individualBalance = Math.round((this.recovery + this.depositYen) - (this.investment + this.replayYen));

        // 受け渡し金額(円)
        this.transferAmount = 0;
    }
}

$(function () {

    // 交換率のオプションを生成
    var exchangeRateSelect = $("#exchangeRate");
    exchangeRateSelect.append(`<option value="0.0"></option>`);
    for (var rate = 4.6; rate <= 6.0; rate += 0.1) {
        exchangeRateSelect.append(`<option value="${rate.toFixed(1)}">${rate.toFixed(1)}</option>`);
    }

    /**
     * ノリ打ち人数に合わせてフォームを生成
    */

    // プレイヤー情報
    generatePlayerForms();
    $("#numberOfPlayers").on("change", generatePlayerForms);

    // ノリ打ち結果
    generatePlayerResults();
    $("#numberOfPlayers").on("change", generatePlayerResults);

    // 受け渡し金額
    generateTransferAmounts();
    $("#numberOfPlayers").on("change", generateTransferAmounts);

});

function generatePlayerForms() {
    var numberOfPlayers = $("#numberOfPlayers").val();
    var playerForms = $("#player-forms");
    playerForms.empty(); // リセット

    for (var i = 1; i <= numberOfPlayers; i++) {
        var playerForm = $("<div>").html(`
            <div id="player-form">
                <a>【プレイヤー${i}】</a><br>
                <label for="playerName${i}">プレイヤー名:</label>
                <input type="text" id="playerName${i}"><br>
                <label for="investment${i}">投資金額(円):</label>
                <input type="text" id="investment${i}" class="numeric-input"><br>
                <label for="replay${i}">再プレイ(枚):</label>
                <input type="text" id="replay${i}" class="numeric-input"><br>
                <label for="recovery${i}">回収金額(円):</label>
                <input type="text" id="recovery${i}" class="numeric-input"><br>
                <label for="deposit${i}">貯メダル(枚):</label>
                <input type="text" id="deposit${i}" class="numeric-input">
            </div>
        `);
        playerForms.append(playerForm);
    }
}

function generatePlayerResults() {
    var numberOfPlayers = $("#numberOfPlayers").val();
    var playerResults = $("#player-results");
    playerResults.empty(); // リセット

    for (var i = 1; i <= numberOfPlayers; i++) {
        var playerResult = $("<div>").html(`
            <label for="individualBalance${i}">プレイヤー${i} さんの個人収支(円):</label>
            <input type="text" id="individualBalance${i}" class="numeric-input" readonly>
        `);
        playerResults.append(playerResult);
    }
}

function generateTransferAmounts() {
    var numberOfPlayers = $("#numberOfPlayers").val();
    var transferAmounts = $("#transfer-amounts");
    transferAmounts.empty(); // リセット

    for (var i = 1; i <= numberOfPlayers; i++) {
        var transferAmount = $("<div>").html(`
            <label for="transferAmount${i}">プレイヤー${i} さんが渡す金額(円):</label>
            <input type="text" id="transferAmount${i}" class="numeric-input" readonly>
        `);
        transferAmounts.append(transferAmount);
    }
}

// グラフを描画する関数
function generateBarChart(players, totalBalancePerPerson) {
    var ctx = document.getElementById('resultsChart').getContext('2d');

    // グラフがすでに存在する場合は破棄
    if (myChart) {
        myChart.destroy();
    }

    // グラフに使用されるデータ構造
    var labels = [];
    var investments = [];
    var replayYens = [];
    var recoverys = [];
    var depositYens = [];
    var individualBalances = [];
    for (var i = 1; i < players.length; i++) {
        var player = players[i];
        labels.push(player.name);
        investments.push(player.investment * (-1));
        replayYens.push(player.replayYen * (-1));
        recoverys.push(player.recovery);
        depositYens.push(player.depositYen);
        individualBalances.push(player.individualBalance);
    }
    var datasets = [
        {
            label: "投資金額",
            data: investments,
            backgroundColor: ['#4169e1']
        },{
            label: "再プレイ",
            data: replayYens,
            backgroundColor: ['#ffa500']
        },{
            label: "回収金額",
            data: recoverys,
            backgroundColor: ['#4169e1']
        },{
            label: "貯メダル",
            data: depositYens,
            backgroundColor: ['#ffa500']
        },{
            label: "個人収支",
            data: individualBalances,
            backgroundColor: ['#fa8072']
        }
    ];

    // totalBalancePerPerson を水平線として追加
    var totalBalancePerPersonLine = {
        label: '１人あたり収支',
        borderColor: ['#ff0000'],
        borderWidth: 5,
        type: 'line',
        fill: false,
        data: Array(players.length).fill(totalBalancePerPerson),
    };
    datasets.push(totalBalancePerPersonLine);

    var options = {
        indexAxis: 'y',
        scales: {
            x: {
                stacked: false,
            },
            y: {
                stacked: false,
            },
        },
    };

    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: options,
    };

    // 新しいグラフを描画
    myChart = new Chart(ctx, config);
}

function calculate() {

    //ラベルを入力されたプレイヤー名に更新
    changeLabel();

    //プレイヤー情報の取得
    var players = [];
    var numberOfPlayers = $("#numberOfPlayers").val();
    for (var i = 1; i <= numberOfPlayers; i++) {
        var playerParm = [];
        playerParm.push($(`#playerName${i}`).val());
        playerParm.push(parseInt($(`#investment${i}`).val()));
        playerParm.push(parseInt($(`#replay${i}`).val()));
        playerParm.push(parseInt($(`#recovery${i}`).val()));
        playerParm.push(parseInt($(`#deposit${i}`).val()));
        players[i] = new Player(playerParm); // あえて index=0 を飛ばしている
    }

    // ノリ打ち結果の出力
    var totalBalance = 0.0;
    for (var i = 1; i <= numberOfPlayers; i++) {
        var p = players[i];
        $(`#individualBalance${i}`).val(parseInt(p.individualBalance)); // 個人収支
        totalBalance += p.individualBalance;
    }

    // 合計収支
    $(`#totalBalance`).val(parseInt(totalBalance));

    // １人あたり収支の計算
    var totalBalancePerPerson = Math.round(totalBalance/numberOfPlayers);
    $(`#totalBalancePerPerson`).val(parseInt(totalBalancePerPerson)); 

    //受渡金額の出力
    for (var i = 1; i <= numberOfPlayers; i++) {
        var p = players[i];
        p.transferAmount = parseInt(p.individualBalance) - parseInt(totalBalancePerPerson)
        $(`#transferAmount${i}`).val(parseInt(p.transferAmount));
    }

    // グラフを描画
    generateBarChart(players, totalBalancePerPerson);
}

function changeLabel() {
    var numberOfPlayers = $("#numberOfPlayers").val();
    for (var i = 1; i <= numberOfPlayers; i++) {
        var playerName = $(`#playerName${i}`).val();
        $(`label[for="individualBalance${i}"]`).text(`${playerName} さんの個人収支(円):`);
        $(`label[for="transferAmount${i}"]`).text(`${playerName} さんが渡す金額(円):`);
    }
}

function capturePage() {
// html2canvasを使用してWebページを画像化する関数
    html2canvas(document.body).then(canvas => {
        var imgData = canvas.toDataURL('image/png');
        var newWindow = window.open('about:blank', 'Webページの画像', '_blank');
        newWindow.document.write('<img src="' + imgData + '" alt="Webページの画像">');
    });
}