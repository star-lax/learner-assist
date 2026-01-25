// Node native fetch available in v18+
const testVision = async () => {
    // 1x1 red dot base64
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    console.log("Starting vision test...");
    try {
        const response = await fetch('http://localhost:5000/api/generate/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                feature: 'explainer',
                input: 'What color is this?',
                attachments: [{
                    name: 'test.png',
                    type: 'image/png',
                    url: base64Image
                }]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Server error:", err);
            return;
        }

        console.log("Receiving stream...");
        const reader = response.body;
        reader.on('data', chunk => {
            console.log("CHUNK:", chunk.toString());
        });
        reader.on('end', () => {
            console.log("Stream ended.");
        });

    } catch (e) {
        console.error("Fetch error:", e.message);
    }
};

testVision();
