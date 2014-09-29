function loop() {
    if (document.querySelectorAll("a.still_listening").length != 0){
        document.querySelectorAll("a.still_listening")[0].click();
        console.log("Successfully clicked 'Are you still listening?' button");
    }
    console.log("Music is still playing...");
    setTimeout(loop, 10 * 1000); // 10 seconds
}
loop();