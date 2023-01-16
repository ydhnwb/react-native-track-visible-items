/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import ListView from './ListView';
import { StarWarsCharacter, useStarWars } from './useStarWars';
import { io } from "socket.io-client";
import axios from 'axios'
import CommentList from './CommentList';

function getAlreadyTracked() {
  // return [{
  //   name: "Luke Skywalker",
  //   picture: ""
  // }]
  return [];
}


const App = () => {
  const [caharacters, setCharacters] = useState<StarWarsCharacter[]>([])
  const [comments, setComments] = useState([])
  const [userId, setUserId] = useState<string>('')
  const socket: any = useRef(null);


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const stopAndReconnectSocket = () => {
    if (socket.current != null) {
      socket.current.off('connect');
      socket.current.off('disconnect');
      socket.current.off('update');
      socket.current.close()
    }

    socket.current = io('http://10.0.2.2:3000', {
      query: {
        userId: userId
      }
    });


    socket.current.on('connect', () => {
      console.log('on-connect')
    });

    socket.current.on('disconnect', () => {
      console.log('on-disconnect')
    });

    socket.current.on('update', () => {
      console.log('on-update')
    });

    console.log('setting up socket', socket.current.connected)

  }

  const getComments = async () => {
    const res = await axios.get('http://10.0.2.2:3000/get-comments').then(res => res.data).catch(e => {
      console.log('axios err', e)
      return []
    })
    setComments(res)
  }

  const setSeen = (commentId: string) => {
    console.log('setSeen', commentId)
    if (socket.current != null) {
      socket.current.emit('setSeen', commentId)
    }
  }

  const setSeenArray = (ids: { _id: string }[]) => {
    if (socket.current != null) {
      socket.current.emit('setSeenArray', JSON.stringify(ids))
    }
  }


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
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <TextInput value={userId} onChangeText={setUserId} placeholder='input user id (as loggedin)' />
        </View>
        <Button title='Connect' onPress={() => {
          if (userId) {
            stopAndReconnectSocket()
          }
        }} />
      </View>
      <Button title='Fetch comment http' onPress={() => { getComments() }} />
      <CommentList comments={comments} setSeen={setSeen} setSeenArray={setSeenArray} userId={userId} />
    </SafeAreaView>
  );
};


export default App;
