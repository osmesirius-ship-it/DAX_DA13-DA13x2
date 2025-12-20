// Test script for loop enforcement system
const { LoopEnforcer } = require('./dist/loop-enforcer');

async function testLoopEnforcement() {
  const enforcer = new LoopEnforcer();
  
  console.log('Testing Loop Enforcement System');
  console.log('===============================');
  
  // Test with generic input
  const genericInput = "Can you please help me with something?";
  const genericOutput = "I would be happy to help you with your request.";
  
  console.log('\n--- Generic Input Test ---');
  console.log('Input:', genericInput);
  console.log('Original Output:', genericOutput);
  
  const enforcedOutput = await enforcer.enforceLoop(
    '13',
    'DA-13',
    genericInput,
    genericOutput
  );
  
  console.log('Enforced Output:', enforcedOutput);
  console.log('Mystical Mode Enabled:', enforcer.isMysticalModeEnabled());
  
  // Test with mystical mode enabled
  console.log('\n--- Enabling Mystical Mode ---');
  enforcer.enableMysticalMode();
  console.log('Mystical Mode Enabled:', enforcer.isMysticalModeEnabled());
  
  const mysticalOutput = await enforcer.enforceLoop(
    '13',
    'DA-13',
    genericInput,
    genericOutput
  );
  
  console.log('Mystical Output:', mysticalOutput);
  
  // Test loop states
  console.log('\n--- Loop States ---');
  const loopStates = enforcer.getAllLoopStates();
  console.log('Number of layers with loop states:', loopStates.size);
  
  const da13State = enforcer.getLoopState('13');
  if (da13State) {
    console.log('DA-13 Loop State:');
    console.log('  Iterations:', da13State.iterationCount);
    console.log('  Character Score:', da13State.lastCharacterCheck);
  }
}

testLoopEnforcement().catch(console.error);
