import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View, Button, Pressable } from 'react-native';
import { Styles } from './styles/soup';
import { Audio } from 'expo-av';


export default function App() {
    const [db, setDb] = useState(null);
    const [text, setText] = useState(null);
    const [updateItems, forceUpdate] = useState(0);
    const [items, setItems] = useState([]);
    const [recording, setRecording] = useState(null);
    const [recordingUri, setRecordingUri] = useState(null);
    const [playback, setPlayback] = useState(null);
    const [permissionsResponse, requestPermission] = Audio.usePermissions();
    const [preProgrammedSounds, setPreProgrammedSounds] = useState([
        require('./assets/sounds/funny.mp3'),
        require('./assets/sounds/SW.mp3'),
        require('./assets/sounds/SW.mp3'),
    ]);
    const [soundObject, setSoundObject] = useState(null);

    const playSound = async (soundURI) => {
        const { sound } = await Audio.Sound.createAsync(soundURI);
        setSoundObject(sound);
        await sound.playAsync();
    };

    useEffect(() => {
        return () => {
            if (soundObject) {
                soundObject.unloadAsync();
            }
        };
    }, [soundObject]);

    // open the database at launch
    useEffect(() => {
        let db = null;
        // Expo SQLite does not work on web, so don't try it
        if (Platform.OS === 'web') {
            db = {
                transaction: () => {
                    return {
                        executeSql: () => { },
                    };
                },
            };
        } else {
            db = SQLite.openDatabase('db.db');
        }
        setDb(db);

        // create the table if it doesn't exist
        db.transaction((tx) => {
            tx.executeSql(
                "create table if not exists items (id integer primary key not null, done int, value text);"
            );
        });
        return () => db ? db.close : undefined; // close the database when we're done
    }, [])

    // update when the database changes [db, updateItems]
    useEffect(() => {
        if (db) {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "select * from items",
                        [],
                        (_, { rows: { _array } }) => { setItems(_array) }
                    )
                }
            )
        }
    }, [db, updateItems])

    // insert a new item into the todo list
    const createRecord = (text) => {
        db.transaction(
            (tx) => {
                tx.executeSql(
                    "insert into items (done, value) values (0, ?)",
                    [text]
                )
                tx.executeSql(
                    "select * from items",
                    [],
                    (_, { rows }) => console.log(JSON.stringify(rows)));
            },
            null,
            forceUpdate(f => f + 1)
        )
    };

    const startRecording = async () => {
        try {
            if (permissionsResponse.status !== 'granted') {
                console.log('Requesting permissions.');
                await requestPermission();
            }
            console.log('Permission is ', permissionsResponse.status);

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording...');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptions.Preset.HighQuality
            );
            setRecording(recording);
            console.log('...recording');
        }
        catch (errorEvent) {
            console.error('Failed to startRecording(): ', errorEvent);
        }
    }

    const stopRecording = async () => {
        try {
            if (recording) {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                createRecord(uri);
                setRecording(null);
                console.log('Recording stopped and stored at ', uri);
            }
        }
        catch (errorEvent) {
            console.error('Failed to stopRecording(): ', errorEvent);
        }
    }

    const playRecordingUri = async (uri) => {
        console.log(uri);
        const sound1 = new Audio.Sound();
        try {
            await sound1.loadAsync({ uri });
            await sound1.replayAsync();
        } catch (error) {
            console.error('Failed to load sound', error);
        }
    }

    return (
        <View style={Styles.container}>
            <Text style={Styles.heading}>Soundboard</Text>



            <View style={Styles.flexRow}>
                <Button
                    title={recording ? 'Stop Recording' : 'Start Recording'}
                    onPress={recording ? stopRecording : startRecording}
                />
                {recordingUri &&
                    <Button
                        title="Play the last sound"
                        onPress={() => playRecordingUri(recordingUri)}
                    />}
            </View>
            <ScrollView style={Styles.listArea}>

                <View style={Styles.buttonContainer}>
                    {preProgrammedSounds.map((soundURI, index) => (
                        <Button
                            key={index}
                            title={`Sound ${index + 1}`}
                            onPress={() => playSound(soundURI)}
                        />
                    ))}
                </View>


                <Text style={Styles.sectionHeading}>Sounds Made</Text>
                {items.map(({ id, value }) => (
                    <Pressable
                        key={id}
                        onPress={() => playRecordingUri(value)}
                        style={({ pressed }) => [
                            Styles.itemStyle,
                            { backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white' }
                        ]}
                    >
                        <Text style={Styles.itemText}>{id}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}
