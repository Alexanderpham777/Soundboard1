import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

const getRandomColor = () => {
    // Generate a random hex color code
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const App = () => {
    // State to store the current background color
    const [backgroundColor, setBackgroundColor] = useState(getRandomColor());

    useEffect(() => {
        // Set up an interval to change the background color every 30 seconds
        const intervalId = setInterval(() => {
            setBackgroundColor(getRandomColor());
        }, 3000); // 3 seconds in milliseconds

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures the effect runs only once on mount


};

export const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: getRandomColor(),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingTop: 70,
        paddingBottom: 50,
    },
    flexRow: {
        borderWidth: 1,
        backgroundColor: 'white',
        padding: 10,
        flexDirection: 'row',
        width: '50%',
        justifyContent: 'center',
        borderRadius: 5,

    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        padding: 5,
        flex: 1,
        height: 48,
        margin: 16,

    },
    itemStyle: {
        borderWidth: 2,
        backgroundColor: 'white',
        padding: 10,
        margin: 6,
        width: '95%',
        justifyContent: 'center',
        alignItems: 'center'

    },
    itemText: {
        fontSize: 15,
        textAlign: 'center',
    },
    listArea: {
        backgroundColor: '#f0f0f0',
        width: '80%',

    },
    sectionHeading: {
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',

    },
    buttonContainer: {

    }
});