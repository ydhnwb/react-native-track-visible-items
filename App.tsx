/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import ListView from './ListView';
import { StarWarsCharacter, useStarWars } from './useStarWars';

function getAlreadyTracked() {
  // return [{
  //   name: "Luke Skywalker",
  //   picture: ""
  // }]
  return [];
}

const App = () => {
  const [caharacters, setCharacters] = useState<StarWarsCharacter[]>([])
  // const [objAlreadySeen, setObjAlreadySeen] = useState()

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const getImgUrl = (resourceUrl: string) => {
      const imgUrlBase =
        "https://starwars-visualguide.com/assets/img/characters/";
      const filePath =
        resourceUrl.split("https://swapi.dev/api/people/")[1].slice(0, -1) +
        ".jpg";
      return imgUrlBase + filePath;
    };

    fetch("https://swapi.dev/api/people/")
      .then((res) => res.json())
      .then((resp) => {
        setCharacters(
          resp.results.map((character: any) => {
            return { name: character.name, picture: getImgUrl(character.url) };
          })
        );
      });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ListView
        characters={caharacters}
        alreadyTracked={getAlreadyTracked()}
      />
    </SafeAreaView>
  );
};


export default App;
