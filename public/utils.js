export function generateColoredText(string, positions) {
    let result = '';
    for (let i = 0; i < string.length; i++) {
        if (positions.includes(i)) {
            result += `<span style="color: red;">${string[i]}</span>`;
        } else {
            result += `<span style="color: green;">${string[i]}</span>`;
        }
    }
    return result;
}
  
export function highlightDifferences(modelString, newString) {
    const differences = [];
    let modelIndex = 0;
    let newIndex = 0;
  
    while (modelIndex < modelString.length || newIndex < newString.length) {
        if (modelString[modelIndex] !== newString[newIndex]) {
        differences.push(newIndex);
  
        if (modelString[modelIndex + 1] === newString[newIndex]) {
            modelIndex++;
        } else if (modelString[modelIndex] === newString[newIndex + 1]) {
            newIndex++;
        }
        }
        modelIndex++;
        newIndex++;
    }
    return differences;
}
  
  
  
  