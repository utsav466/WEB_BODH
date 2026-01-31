

"use server";

export const exampleAction= async ()=>{
    await new Promise((resolve)=> setTimeout(resolve, 2000));
    return{
        success: true,
        message: "action completed successfully",
        data: null
    };
}