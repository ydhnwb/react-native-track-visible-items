import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Image, StyleSheet, Text, View, ViewToken } from 'react-native';

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
    setSeenArray: (ids: { _id: string }[]) => void
    userId: string
}

type SeenItem = {
    [key: string]: IComment;
};

export default function CommentList({
    comments,
    setSeen,
    setSeenArray,
    userId
}: CommentListProps) {
    const [_firstUnreadItem, _setFirstUnreadItem] = useState<IComment | undefined>()
    const [isUnreadCommentsAlreadyPopulated, setUnreadCommentsAlreadyPopulated] = useState<boolean>(false)


    const onViewableItemsChanged = useCallback(
        (info: { changed: ViewToken[] }): void => {
            const visibleItems = info.changed.filter((entry) => entry.isViewable);
            const isHaveUnread = visibleItems.find((c) => {
                let isUnreadBecauseEmpty = !c.item.seenBy
                if (isUnreadBecauseEmpty) {
                    return true
                }
                const isUnreadBecauseNotSeeing = c.item.seenBy.find((id: string) => id == userId)
                if (isUnreadBecauseNotSeeing) {
                    return false
                }
                return false
            })
            if (isHaveUnread) {
                setUnreadCommentsAlreadyPopulated((prevState) => {
                    return prevState == false ? true : prevState
                })
            }

        },
        []
    );

    useEffect(() => {
        if (isUnreadCommentsAlreadyPopulated) {
            const unreads = comments.filter((c: IComment) => !Boolean(c.seenBy) || (c.seenBy && c.seenBy.find(id => id == userId) == undefined)).map((c: IComment) => ({ _id: c._id }))
            console.log('Here is unreads:', JSON.stringify(unreads))
            setSeenArray(unreads)
            console.log('first', _firstUnreadItem)
            _setFirstUnreadItem(undefined)

        }
    }, [isUnreadCommentsAlreadyPopulated])


    useEffect(() => {
        if (isUnreadCommentsAlreadyPopulated) {
            //we can ignore if it's already populated. But if you want to keep listen to the unread even
            // when user is on comments page, I think we should delete this. but finding comments is costly
            return
        }
        _setFirstUnreadItem((prev) => {
            const x = comments.find((c: IComment) => !c.seenBy || (c.seenBy && c.seenBy.find(id => id == userId) == undefined))
            return x
        })
    }, [comments])

    return (
        <View>
            {/* <Text>{isUnreadCommentsAlreadyPopulated ? 'true' : 'false'}</Text> */}
            <FlatList
                contentContainerStyle={{ paddingBottom: 56 }}
                data={comments}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 70, // minimal 70% content card ditampilkan, maka akan dihitung threshold time
                    minimumViewTime: 5000, //jika threshold time (waktu dilihat) lebih dari 1 detik, maka akan dianggap "telah dibaca"
                }}
                renderItem={({ item, index }) => {
                    return (
                        <View>
                            {

                                _firstUnreadItem && _firstUnreadItem._id == item._id && <UnreadSeparator />
                            }

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
                                    </View>
                                </View>
                            </View>
                        </View>

                    );
                }}
            />
        </View>

    );
}


const UnreadSeparator: React.FC = () => {
    return <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View
            style={{
                flex: 1,
                borderBottomColor: 'red',
                borderBottomWidth: 10,
            }} />
        <Text> Unread Comment </Text>
        <View
            style={{
                flex: 1,
                borderBottomColor: 'red',
                borderBottomWidth: 10,
            }} />
    </View>

}