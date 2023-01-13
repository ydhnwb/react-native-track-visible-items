import React, { useCallback, useState } from 'react'
import { Dimensions, FlatList, Image, Text, View, ViewToken } from 'react-native';

interface IComment {
    _id: string,
    mentions: [],
    replies: [],
    message: string,
    type: string,
    module: string,
    createdDate: string,
    updatedDate: string,
    seenBy?: string[]
}

interface CommentListProps {
    comments: IComment[];
    setSeen: (commentId: string) => void
    userId: string
}

type SeenItem = {
    [key: string]: IComment;
};

export default function CommentList({
    comments,
    setSeen,
    userId
}: CommentListProps) {
    const [objAlreadySeen, setObjAlreadySeen] = useState(new Map<String, boolean>())
    const [_alreadySeen, setAlreadySeen] = useState<SeenItem[]>(
        // initialize state
        () => {
            return [].map((item) => {
                return { [item._id]: item };
            });
        }
    );

    const updateCharacterToBeAlreadySeen = (item: IComment) => {
        console.log("Update...")
        if (!objAlreadySeen.get(item._id)) {
            setObjAlreadySeen(new Map(objAlreadySeen.set(item._id, true)))
            setSeen(item._id)
        }
    }

    const trackItem = (item: IComment) => {
        updateCharacterToBeAlreadySeen(item)
    }


    const onViewableItemsChanged = useCallback(
        (info: { changed: ViewToken[] }): void => {
            const visibleItems = info.changed.filter((entry) => entry.isViewable);
            setAlreadySeen((prevState: SeenItem[]) => {
                // perform side effect
                visibleItems.forEach((visible) => {
                    if (visible.item?.seenBy != undefined && visible.item.seenBy.includes(userId)) {
                        console.log('ignoring because it is already read by response')
                        return
                    }
                    const exists = prevState.find((prev) => visible.item._id in prev);
                    if (!exists) trackItem(visible.item);
                });

                // calculate new state
                return [
                    ...prevState,
                    ...visibleItems.map((visible) => {
                        return ({
                            [visible.item._id]: visible.item,
                        })
                    }),
                ];
            });
        },
        []
    );

    return (
        <FlatList
            data={comments}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{
                itemVisiblePercentThreshold: 70, // minimal 70% content card ditampilkan, maka akan dihitung threshold time
                minimumViewTime: 1000, //jika threshold time (waktu dilihat) lebih dari 1 detik, maka akan dianggap "telah dibaca"
            }}
            renderItem={({ item, index }) => {
                return (
                    <View
                        key={item._id}
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
                                    source={{ uri: 'https://cdn.searchenginejournal.com/wp-content/uploads/2022/06/image-search-1600-x-840-px-62c6dc4ff1eee-sej-1280x720.png' }}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        resizeMode: "center",
                                    }}
                                />
                            </View>
                            <View style={{ paddingLeft: 10, flex: 1 }}>
                                <Text style={{ fontSize: 20 }}>
                                    {item.message}
                                </Text>
                                {
                                    item?.seenBy && <Text>Seen by id user: {item.seenBy.join(',')}</Text>
                                }
                                {
                                    item?.seenBy && item?.seenBy?.includes(userId) ? <Text>Seen by db/response</Text> :
                                        Boolean(objAlreadySeen.get(item._id)) ? (<Text>Seen</Text>) : <Text>Not seen</Text>
                                }
                            </View>
                        </View>
                    </View>
                );
            }}
        />
    );
}