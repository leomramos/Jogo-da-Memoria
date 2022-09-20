import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Slider from '@react-native-community/slider';
import { SafeAreaView, Text, TouchableOpacity, Button, View } from 'react-native';
import Styled from 'styled-components';

const CSS_COLORS = [
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "Blue",
  "BlueViolet",
  "Brown",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "CornflowerBlue",
  "Crimson",
  "DarkBlue",
  "DarkGoldenRod",
  "DarkGray",
  "DarkGreen",
  "DarkKhaki",
  "DarkMagenta",
  "DarkOrange",
  "DarkSeaGreen",
  "MistyRose",
  "DarkTurquoise",
  "DeepPink",
  "DimGray",
  "Gold",
  "GoldenRod",
  "PaleGreen",
  "HotPink",
  "IndianRed ",
  "Indigo",
  "LightPink",
  "MediumOrchid"
];

const pairs = Math.floor(Math.sqrt(CSS_COLORS.length * 2));

const maxSize = pairs > 10 ? 10 : pairs % 2 === 0 ? pairs : pairs - 1;

// in percentage
const botUseLast = 30;
const botRememberBoth = 10;
const botRemember = 20;

let lastPlayed = [];
let timeout;
let botMemory = [];
let playing;

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}

const getEmptyArray = (length, fill) => {
  return Array(length).fill(fill);
}

const Container = Styled(SafeAreaView)`
  flex: 1;
  padding: 50px 20px;
  background: #e1e1e1;
  justify-content: center;
  align-items: center;
`

const Table = Styled(View)`
  flex-wrap: wrap;
  width: 100%;
`

const Row = Styled(View)`
  flex-direction: row;
  width: 100%;
`

const GridSizeDisplay = Styled(Text)`
  font-size: 50px;
`

const TurnInfo = Styled(Text)`
  margin-top: 20px;
  font-size: 30px;
`

const PointsInfo = Styled(Text)`
  font-size: 20px;
`

const PointsDisplay = Styled(View)`
  width: 100%;
  margin: 30px 0;
  padding: 0 20px;
  flex-direction: row;
  justify-content: space-between;
`

const Square = ({ info, chosen, action, waiting, discovered, playing }) => {
  const Content = Styled(TouchableOpacity)`
    flex-grow: 1;
    margin: ${info.margin};
    background: ${chosen || discovered ? info.color.toLowerCase() : 'black'};
    opacity: ${waiting && !discovered && !chosen ? 0.03 : 1};
    transition: transform 4s ease-in;
    transform: scale(${chosen || discovered ? 1.1 : 1});
`

  return <Content style={{ aspectRatio: 1 / 1 }} disabled={waiting || discovered || chosen || !playing} onPress={action} />;
}


const startGame = (gridSize) => {
  let initialColors = getEmptyArray(gridSize, getEmptyArray(gridSize, null));

  const selectedColors = [];

  let colors = getEmptyArray(Math.floor(Math.pow(gridSize, 2) / 2), null).map(() => {
    let random;

    do {
      random = getRandom(0, CSS_COLORS.length);
    } while (selectedColors.indexOf(random) !== -1);

    selectedColors.push(random);
    return {
      'name': CSS_COLORS[random],
      'amount': 2
    }
  })

  let marginSize = 50 / gridSize;
  marginSize = marginSize <= 10 ? marginSize : 10;
  marginSize += 'px';

  let res = initialColors.map(row => {
    return row = row.map(_ => {
      const random = getRandom(0, colors.length);
      let selected = colors[random];
      --selected.amount === 0 && colors.splice(random, 1);
      return { 'color': selected.name, 'margin': marginSize };
    })
  })

  return res;
};

export default function App() {
  const [gridSize, setGridSize] = useState(4);
  const [winner, setWinner] = useState(null);
  const [gameColors, setGameColors] = useState([]);
  const [restartGame, setRestartGame] = useState(true);
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [curTurn, setCurTurn] = useState(true);
  const [turnEnded, setTurnEnded] = useState(false);
  const [discovered, setDiscovered] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [botPoints, setBotPoints] = useState(0);

  useEffect(() => {
    clearTimeout(timeout);
    setTurnEnded(true);
    setWinner(null);
    setGameColors([]);
    setSelectedSquares([]);
    setDiscovered([]);
    setCurTurn(true);
    setUserPoints(0);
    setBotPoints(0);
    botMemory = [];

    setGameColors(startGame(gridSize));
    setRestartGame(false);
    setTurnEnded(false);
    playing = true;
  }, [restartGame]);

  const checkArray = (el, item) => {
    return el.findIndex(el => JSON.stringify(el) === JSON.stringify(item)) !== -1;
  }

  const nextTurn = (change = true) => {
    setTimeout(_ => {
      setTurnEnded(false);
      setSelectedSquares([]);
      !change && !curTurn && botPlay();
      change && setCurTurn(!curTurn);
    }, 1000);
  }

  const handleTurn = (x, y) => {
    setSelectedSquares([...selectedSquares, { x, y }]);
  }

  const botSelect = (x, y, x1, y1) => {
    timeout = setTimeout(() => {
      setSelectedSquares([{ x, y }]);
      timeout = setTimeout(() => {
        setSelectedSquares([{ x, y }, { x: x1, y: y1 }]);
      }, getRandom(200, 500));
    }, getRandom(200, 500));
  }

  const botPlay = () => {
    let x, y, x1, y1;
    x = y = x1 = y1 = null;

    if (!playing) return;

    if (getRandom(0, 100) <= botUseLast) {
      if (!lastPlayed.every(el => {
        let color = gameColors[el.x][el.y].color;
        const result = botMemory.find(mem => mem.color === color && !(mem.x === el.x && mem.y === el.y));

        if (result) {
          x = el.x;
          y = el.y;
          x1 = result.x;
          y1 = result.y;
          return !true;
        }

        return !false;
      })) {
        return botSelect(x, y, x1, y1);
      }
    }

    if (getRandom(0, 100) <= botRememberBoth) {
      if (!botMemory.every(el => {
        el.color;
        const result = botMemory.find(mem => mem.color === el.color && !(mem.x === el.x && mem.y === el.y));

        if (result) {
          x = el.x;
          y = el.y;
          x1 = result.x;
          y1 = result.y;
          return !true;
        }

        return !false;
      })) {
        return botSelect(x, y, x1, y1);
      }
    }

    while (
      (x === null && y === null) ||
      (
        (checkArray(lastPlayed, { x, y }) && gameColors[lastPlayed[0].x][lastPlayed[0].y].color === gameColors[lastPlayed[1].x][lastPlayed[1].y].color) ||
        checkArray(discovered, { x, y }) ||
        (x === gridSize || y === gridSize)
      )
    ) {
      x = getRandom(0, gridSize);
      y = getRandom(0, gridSize);
    }

    if (getRandom(0, 100) <= botRemember) {
      let color = gameColors[x][y].color;
      const result = botMemory.find(mem => mem.color === color && !(mem.x === x && mem.y === y));

      if (result) {
        x1 = result.x;
        y1 = result.y;
        return botSelect(x, y, x1, y1);
      }
    }

    while (
      (x1 === null && y1 === null) ||
      (
        checkArray(lastPlayed, { x: x1, y: y1 }) ||
        checkArray(discovered, { x: x1, y: y1 }) ||
        (x1 === x && y1 === y) ||
        (x1 === gridSize || y1 === gridSize) ||
        (x1 === null || y1 === null)
      )
    ) {
      x1 = getRandom(0, gridSize);
      y1 = getRandom(0, gridSize);
    }

    botSelect(x, y, x1, y1);
  }

  const checkPoint = _ => {
    const x = selectedSquares[0]['x'];
    const y = selectedSquares[0]['y'];
    const x1 = selectedSquares[1]['x'];
    const y1 = selectedSquares[1]['y'];
    lastPlayed = [{ x, y }, { x: x1, y: y1 }];

    if (gameColors[x][y].color === gameColors[x1][y1].color) {
      setDiscovered([...discovered, { x, y }, { x: x1, y: y1 }]);
      curTurn ? setUserPoints(userPoints + 1) : setBotPoints(botPoints + 1);
      botMemory = botMemory.filter(mem => (mem.x !== x || mem.y !== y) && (mem.x !== x1 || mem.y !== y1));
      nextTurn(false);
    } else {
      selectedSquares.forEach(el => {
        let square = { ...el };
        square.color = gameColors[square.x][square.y].color;
        if (!checkArray(botMemory, square)) {
          botMemory.push(square);
        }
      })
      nextTurn();
    }
  }

  useEffect(() => {
    if (!curTurn) botPlay();
  }, [curTurn])

  const handleButton = () => {
    setRestartGame(true);
  }

  useEffect(() => {
    if (discovered.length === Math.pow(gridSize, 2)) {
      setWinner(userPoints === botPoints ? "Empate" : userPoints > botPoints ? "Você ganhou" : "Máquina ganhou");
      clearTimeout(timeout);
      playing = false;
      timeout = setTimeout(() => {
        setRestartGame(true);
      }, 5000)
    }
  }, [discovered])

  useEffect(() => {
    if (selectedSquares.length === 2) {
      setTurnEnded(true);
      checkPoint();
    }
  }, [selectedSquares])

  return (
    <Container>
      <View style={{ alignItems: 'center', marginBottom: 50 }}>
        <GridSizeDisplay>{gridSize}</GridSizeDisplay>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={4}
          maximumValue={maxSize}
          step={2}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          value={gridSize} onValueChange={value => setGridSize(value)}
        />
        <Button title={winner !== null ? "Jogar novamente" : "Reiniciar"} onPress={handleButton} />
      </View>
      <Table>
        {gameColors.map((row = [], x) => (
          <Row key={x}>
            {row.map((info, y) =>
              <Square
                key={`${x}-${y}-${info.color}-${new Date()}`}
                info={info}
                action={() => handleTurn(x, y)}
                chosen={checkArray(selectedSquares, { x, y })}
                gridSize={gridSize}
                waiting={turnEnded}
                discovered={checkArray(discovered, { x, y })}
                playing={curTurn}
              />
            )}
          </Row>
        ))}
      </Table>
      <TurnInfo>{winner ? winner : curTurn ? "Você joga" : "Máquina joga"}</TurnInfo>
      <PointsDisplay>
        <PointsInfo>Você: {userPoints}</PointsInfo>
        <PointsInfo>Máquina: {botPoints}</PointsInfo>
      </PointsDisplay>
      <StatusBar style="auto" />
    </Container>
  );
}