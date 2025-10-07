// Using built-in fetch

async function testImageGeneration() {
  try {
    console.log('Testing image generation...');
    
    const response = await fetch('http://localhost:9200/api/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'a cat',
        style: 'realistic'
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data.imageUrl) {
      console.log('✅ SUCCESS! Generated REAL image!');
      console.log('Image URL length:', data.data.imageUrl.length);
      console.log('Provider:', data.data.provider);
    } else {
      console.log('❌ FAILED:', data.error);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testImageGeneration();
