const gameBoard = (() => {
    let content = ['','','','','','','','','',];

    const WIN_COMBINATIONS = [
        [0, 1, 2], [3, 4, 5],
        [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    const squareClickHandler = ({target}) => {
        if(target.textContent !== '' || Game.getWinner() !== null) return;
        const {index} = target.dataset;
        const activePlayer = Game.getActivePlayer();

        updateSquare(index, activePlayer.mark);
        Game.incTurns();
        checkWin(activePlayer);
        displayController.showScore(Game.players);
        Game.changeActivePlayer();

        if(Game.checkGameOver()) {
            const squares = document.querySelectorAll('.square');
            squares.forEach(square => {
                square.classList.remove('hover');
                square.style.cursor = 'default';
            });
        }
    }

    const createSquare = (index) => {
        const square = document.createElement('div');
        square.setAttribute('class', 'square flex hover');
        square.setAttribute('data-index', index);
        square.addEventListener('click', squareClickHandler);
        return square;
    }

    const renderSquares = () => {
        const newContent = content.map((mark, index) => createSquare(index));
        const gameBoardContainer = document.querySelector('#gameBoardContainer');
        gameBoardContainer.replaceChildren(...newContent);
    }

    const updateSquare = (index, mark) => {
        const square = document.querySelector(`[data-index='${index}']`);
        square.classList.add('class', `${mark}`);
        square.textContent = mark;
    }

    const checkWin = (activePlayer) => {
        const gameBoardContainer = document.querySelector('#gameBoardContainer');
        const squares = gameBoardContainer.querySelectorAll(`.${activePlayer.mark}`);
        const indices = [];

        squares.forEach(square => indices.push(parseInt(square.dataset.index)));

        for(let i = 0; i < WIN_COMBINATIONS.length; i++) {
            let overlapQuantity = 0;

            indices.forEach(index => {
                if(WIN_COMBINATIONS[i].includes(index)) overlapQuantity++;
            });

            if(overlapQuantity === 3) {
                Game.updateScore(activePlayer.mark);
                Game.setWinner(activePlayer.mark);
                displayController.highlightWinCombination(WIN_COMBINATIONS[i]);
                return;
            }
        }

        if (Game.checkDraw()) Game.updateScore('draw');
    }

    return {renderSquares}
})();

const Player = (mark) => {
    let active = false;
    return {mark, active};
}

const scoreContainer = document.querySelector('#scoreContainer');
const gameBoardWrapper = document.querySelector('#gameBoardWrapper');
const initialScreen = document.querySelector('#initialScreen');
const btnPanel = document.querySelector('#btnPanel');

const displayController = (() => {
    const init = () => {
        const playerMarks = document.querySelector('#player-marks');
        playerMarks.addEventListener('click', choosingPlayerMarkHandler);
    }

    const choosingPlayerMarkHandler = ({target})=> {
        const mark1 = target.dataset.mark;
        if(mark1 === undefined) return;

        const player1 = Player(mark1);
        const mark2 = mark1 === 'X' ? 'O' : 'X';
        const player2 = Player(mark2);

        // X plays first
        if(mark1 === 'X') {
            player1.active = true;
        } else {
            player2.active = true;
        }

        Game.addPLayer(player1);
        Game.addPLayer(player2);

        initialScreen.classList.add('disabled');
        scoreContainer.classList.remove('disabled');
        gameBoardWrapper.classList.remove('disabled');
        btnPanel.classList.remove('disabled');
        gameBoard.renderSquares();
    }

    const showScore = (players) => {
        const playerXScoreContainer = document.querySelector('#x-score');
        const playerOScoreContainer = document.querySelector('#o-score');
        const drawScoreContainer = document.querySelector('#draw-score');

        if(!players) {
            playerXScoreContainer.textContent = '0';
            playerOScoreContainer.textContent = '0';
            drawScoreContainer.textContent = '0';
            return;
        }

        if (Game.checkDraw()) {
            drawScoreContainer.textContent = Game.getScore('draw').toString();
            return;
        }

        players.forEach(player => {
            if(player.mark === 'X') {
                playerXScoreContainer.textContent = Game.getScore(player.mark);
            } else {
                playerOScoreContainer.textContent = Game.getScore(player.mark);
            }
        });
    }

    const highlightWinCombination = (combination) => {
        const squares = document.querySelectorAll('.square');

        squares.forEach(square => {
            const index = parseInt(square.dataset.index);
            if(combination.includes(index)) {
                square.classList.add('win');
            }
        })
    }

    return {init, showScore, highlightWinCombination}
})();

const Game = (() => {
    const MAX_AMOUNT_OF_TURNS = 9;
    const players = [];
    let turns = 0;
    let winner = null;

    const score = {
        draw: 0,
        X: 0,
        O: 0
    }

    const getActivePlayer = () => players.filter(player => player.active)[0];

    const addPLayer = (player) => players.push(player);

    const updateScore = (scoreToUpdate) => score[scoreToUpdate]++;

    const changeActivePlayer = () => {
        players.forEach(player => player.active = !player.active);
    }

    const getScore = (scoreKey) => score[scoreKey];

    const setWinner = (winnerMark) => winner = winnerMark;
    const getWinner = () => winner;

    const incTurns = () => turns++;
    const getTurns = () => turns;

    const checkDraw = () => {
        return getTurns() === MAX_AMOUNT_OF_TURNS && getWinner() === null;
    }

    const checkGameOver = () => {
        return getWinner() !== null || checkDraw();
    }

    const nextRound = () => {
        winner = null;
        turns = 0;
        gameBoard.renderSquares();
    }

    const reset = () => {
        nextRound();
        score.draw = 0;
        score.X = 0;
        score.O = 0;
        displayController.showScore()
    }

    return {players, reset, nextRound, checkGameOver, checkDraw, setWinner, getWinner, getTurns, incTurns, getScore, updateScore, addPLayer, getActivePlayer, changeActivePlayer}
})();

const nextRoundBtn = document.querySelector('#nextRound');
const resetGameBtn = document.querySelector('#resetGame');
nextRoundBtn.addEventListener('click', Game.nextRound);
resetGameBtn.addEventListener('click', Game.reset);

displayController.init();
