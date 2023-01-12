
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  ViewToken
} from "react-native";

import { StarWarsCharacter } from "./useStarWars";

interface ListViewProps {
  characters: StarWarsCharacter[];
  alreadyTracked: StarWarsCharacter[];
}

type SeenItem = {
  [key: string]: StarWarsCharacter;
};

export default function ListView({
  characters,
  alreadyTracked,
}: ListViewProps) {
  // console.log("render");
  const [objAlreadySeen, setObjAlreadySeen] = useState(new Map<String, boolean>())

  const [_alreadySeen, setAlreadySeen] = useState<SeenItem[]>(
    // initialize state
    () => {
      return alreadyTracked.map((item) => {
        return { [item.name]: item };
      });
    }
  );

  const updateCharacterToBeAlreadySeen = (item: StarWarsCharacter) => {
    console.log("Update...")
    if (!objAlreadySeen.get(item.name)) {
      setObjAlreadySeen(new Map(objAlreadySeen.set(item.name, true)))
    }
  }

  const trackItem = (item: StarWarsCharacter) => {
    updateCharacterToBeAlreadySeen(item)
  }


  const onViewableItemsChanged = useCallback(
    (info: { changed: ViewToken[] }): void => {
      const visibleItems = info.changed.filter((entry) => entry.isViewable);

      setAlreadySeen((prevState: SeenItem[]) => {
        // perform side effect
        visibleItems.forEach((visible) => {
          const exists = prevState.find((prev) => visible.item.name in prev);
          if (!exists) trackItem(visible.item);
        });

        // calculate new state
        return [
          ...prevState,
          ...visibleItems.map((visible) => {
            return ({
              [visible.item.name]: visible.item,
            })
          }),
        ];
      });
    },
    []
  );

  return (
    <FlatList
      style={styles.container}
      data={characters}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70, // minimal 70% content card ditampilkan, maka akan dihitung threshold time
        minimumViewTime: 1000, //jika threshold time (waktu dilihat) lebih dari 1 detik, maka akan dianggap "telah dibaca"
      }}
      renderItem={({ item, index }) => {
        return (
          <View
            key={item.name}
            style={{
              height: 200,
              width: Dimensions.get("window").width,
            }}
          >

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 20,
                backgroundColor:
                  index % 2 === 0 ? "rgb(211,191,129)" : "rgb(162, 162, 70)",
              }}
            >
              <View style={{ width: Dimensions.get("window").width * 0.33 }}>
                <Image
                  source={{ uri: item.picture }}
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "center",
                  }}
                />
              </View>
              <View style={{ paddingLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 20 }}>
                  {item.name}
                </Text>
                {
                  Boolean(objAlreadySeen.get(item.name)) ? (<Text>Seen</Text>) : <Text>Not seen</Text>
                }
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {},
});
