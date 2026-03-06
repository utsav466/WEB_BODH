"use client";
import { useState, ReactNode, createContext, useContext } from "react";
const MyContext = createContext<any>(null); // what to share
export const MyContextProvider = ({children}: {children: ReactNode}) => {
    const [value, setValue] = useState(0); // shared state
    return (
        <MyContext.Provider value={{value, setValue}}> // value to share
            {children}
        </MyContext.Provider>
    )
}
export default function Page() {
    return (
        <MyContextProvider>
            <MyComponent/>
        </MyContextProvider>
    );
}
function MyComponent() {
    const {value, setValue} = useContext(MyContext);
    return (
        <div>
            <div>Value: {value}</div>
            <button onClick={() => setValue(value + 1)}>Increment</button>
            <AnotherComponent/>
        </div>
    );
}

function AnotherComponent() {
    const {setValue} = useContext(MyContext);
    return (
        <div>
            <button onClick={() => setValue((prev: number) => prev - 1)}>Decrement</button>
        </div>
    );
}