// Somewhere in this page I think I've done like "Nan == Nan" or something.
// So now basicallly I just found out that doesn't really work,
// see https://stackoverflow.com/questions/19955898/why-is-nan-nan-false,
// so
// todo
// replace any "NaN" equality operators with "isNaN()".

var vertices = [ ];
var vertexCount = 0;
var gl;
var programDetails;
var viewMatrix;  // viewMatrix sets the camera position.
var vertexShaderProgram = `
	attribute vec4 aVertexPosition;
	
	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;
	
	void main() {
		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	}
`;
var fragmentShaderProgram = `
	void main() {
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}
`;
var shaderProgram;
var fileList;

// Functions
//     setup()
//     firstTriangle()
//     addVertex()
//     drawScene(gl, programDetails)
//     logVertices()

function setup()
{
	var canvas = document.getElementById("webglCanvas1");
	gl = canvas.getContext("webgl");
	if (gl === null) {
		alert("Problem, could not get a WebGL context.");
		return;
	}
    
    viewMatrix = mat4.create();

	shaderProgram = makeShaderProgram();

	programDetails = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
			modelViewMatrix:  gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
		},
	};
	
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
}
setup();


function addTriangle()
{
    var vertex1AsString = document.getElementById("vertex1Textbox").value;
	var vertex2AsString = document.getElementById("vertex2Textbox").value;
	var vertex3AsString = document.getElementById("vertex3Textbox").value;
	
	var verticesAsStrings = [ vertex1AsString, vertex2AsString, vertex3AsString ];
	
	for (let i = 0; i < verticesAsStrings.length; i++)
	{
		var comma1Index = verticesAsStrings[i].indexOf(',');
		var comma2Index = verticesAsStrings[i].indexOf(',', comma1Index + 1);
		
		var vertexXAsString = verticesAsStrings[i].slice(0, comma1Index);
		var vertexYAsString = verticesAsStrings[i].slice(comma1Index + 1, comma2Index);
		var vertexZAsString = verticesAsStrings[i].slice(comma2Index + 1);
		
		var vertexX = Number(vertexXAsString);
		var vertexY = Number(vertexYAsString);
		var vertexZ = Number(vertexZAsString);
		
		var goodInput = true;
		if (isNaN(vertexX) || isNaN(vertexY) || isNaN(vertexZ))
				goodInput = false;
		if ( (vertexX < -1.0 || vertexX > 1.0) ||
	         (vertexY < -1.0 || vertexY > 1.0) ||
		     (vertexZ < -1.0 || vertexZ > 1.0) )
				goodInput = false;
		if (goodInput == false) {
			alert("There was some bad input. Bailing out.");
			return;
		}
		
		vertices = vertices.concat(vertexX);
		vertices = vertices.concat(vertexY);
		vertices = vertices.concat(vertexZ);
	}
	
	vertexCount += 3;
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
}

function addStuffToArray()
{
	var stuffAsString = document.getElementById("addStuffTextbox").value;
    
    // while (stuffAsString.indexOf(',') (next comma though)  !=   -1)
    // indexOf() returns -1 (negative one) if the thing was not found.

    var leftCommaIndex = -1;
    var rightCommaIndex;
    while (true)
    {
        rightCommaIndex = stuffAsString.indexOf(',', leftCommaIndex + 1);
        
        if (rightCommaIndex == -1)
            break;
        
        var valueAsString = stuffAsString.slice(leftCommaIndex + 1, rightCommaIndex);
        var value = Number(valueAsString);
        // Could error-check here if desired.
        vertices = vertices.concat(value);
        
        leftCommaIndex = rightCommaIndex;
    }
	
    // Probably at the time (point in the code) when "vertexCount" is used,
    // just calculate it from the length of "vertices".
    // (I believe "vertexCount" should be ("vertices.length"/3).
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
	// Code for the above-mentioned error-checking.
	//var goodInput = true;
	//if (isNaN(vertexX) || isNaN(vertexY) || isNaN(vertexZ))
	//	goodInput = false;
	//if ( (vertexX < -1.0 || vertexX > 1.0) ||
	//     (vertexY < -1.0 || vertexY > 1.0) ||
	//	 (vertexZ < -1.0 || vertexZ > 1.0) )
	//	goodInput = false;
	//if (goodInput == false)
	//{
	//	alert("There was some kind of bad input. Baliling out.");
	//	return;
	//}
}
// Interesting and useful fact, it locks out the entire page
// when the function encounters a non-terminating loop.
// (You cannot even build a loop-stop button... because all
//  other buttons stop responding.)

document.getElementById("chooseModelFilesInput").addEventListener("change", updateFilesList, false);
function updateFilesList()
{
    // You can see the files the user picked by doing
    // `this.files`.
    // For example,
    // `var file_list = this.files;`
    
    fileList = this.files;
    
    //var fileReader = new FileReader();
    
}

function loadModelv1()
{
    // It is advised to make sure that your model file follows the right format.
    // If the load function runs into wrong formatting there's not a clearly defined
    // behavior for what it will do, more than likely it will be undesirable.
    
    vertices = [];
    
    const fileReader = new FileReader();
    if (fileList[0])
        fileReader.readAsText(fileList[0]);  //and now "fileReader.result" has the contents of the file.
    else {
        alert('Choose a file from your device first.');
        return;
    }
    
    // Example with using an ArrayBuffer.
    //     var buffer1 = new ArrayBuffer(8);
    //     var view1 = new Int32Array(buffer);
    //
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer#examples
    
    // If you do it as an ArrayBuffer, to use the result you do something like
    //    var 
    
    // Looking at https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsBinaryString#examples .
    // Probably why I'm getting a error is that, when I tell the FileReader to start reading the file,
    // there acutually is some time before it fijnishes reading it and the result is ready.
    // So you have to set up an event so that you don't *do things with* the result,
    // until the FileReader has indicated that it's done reading the file.
    //
    //var leftCommaIndex = -1;
    //var rightCommaIndex;
    //while (true) {
    //    rightCommaIndex = fileReader.result.indexOf(',', leftCommaIndex + 1);
    //    
    //    if (rightCommaIndex == -1)
    //        break;
    //    
    //    var valueAsString = fileReader.result.slice(leftCommaIndex + 1, rightCommaIndex);
    //    var value = Number(valueAsString);
    //    // Could error-check here if desired.
    //    vertices = vertices.concat(value);
    //    
    //    leftCommaIndex = rightCommaIndex;
    //}
    //
    //vertexCount = Math.floor(vertices.length / 3);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
}

function loadModelv2()
{
    // It is advised to make sure that your model file follows the right format.
    // If the load function runs into wrong formatting there's not a clearly defined
    // behavior for what it will do, more than likely it will be undesirable.
    
    vertices = [];
    
    const fileReader = new FileReader();
    
    fileReader.onload = () =>
    {
        var leftCommaIndex = -1;
        var rightCommaIndex;
        
        while (true)
        {
            rightCommaIndex = fileReader.result.indexOf(',', leftCommaIndex + 1);
            
            if (rightCommaIndex == -1)
                break;
            
            var valueAsString = fileReader.result.slice(leftCommaIndex + 1, rightCommaIndex);
            var value = Number(valueAsString);
            // Could error-check here if desired.
            vertices = vertices.concat(value);
            
            leftCommaIndex = rightCommaIndex;
        }
        
        vertexCount = Math.floor(vertices.length / 3);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    }
    
    
    if (fileList[0])
        fileReader.readAsText(fileList[0]);  //and now "fileReader.result" has the contents of the file.
    else {
        alert('Choose a file from your device first.');
        return;
    }
}




function setFragmentColor()
{
	var fragmentColorsAsString = document.getElementById("setFragmentColorTextbox").value;
	// vec4(red, green, blue , alpha)
	
	var comma1Index = fragmentColorsAsString.indexOf(",");
	var comma2Index = fragmentColorsAsString.indexOf(",", comma1Index + 1);
	var comma3Index = fragmentColorsAsString.indexOf(",", comma2Index + 1);
	
	// "javascript string.indexOf"
	// This functions returns...
	//     -- the index of the first occurrence of searchString, when searchString is found.
	//     -- -1 if it's not found.
	
	if (comma1Index == -1 ||
	    comma2Index == -1 ||
		comma3Index == -1)
	{
		alert('Problem when setting fragment color. The 4 values need to be comma-separated (for example, "0.5, 0.1, 0.1, 1.0")');
		return;
	}
	// Requirement 1 done. (There has to be 3 commas, to create 4 comma-separated values.)
	
	var redString   = fragmentColorsAsString.slice(0, comma1Index);
	var greenString = fragmentColorsAsString.slice(comma1Index + 1, comma2Index);
	var blueString  = fragmentColorsAsString.slice(comma2Index + 1, comma3Index);
	var alphaString = fragmentColorsAsString.slice(comma3Index + 1);
	
	// Next step. Result from coercing "xString" (x = red, green, etceter) into a Number.
	
	var red = parseFloat(redString);
	var green = parseFloat(greenString);
	var blue = parseFloat(blueString);
	var alpha = parseFloat(alphaString);
	
	if (isNaN(red) ||
	    isNaN(green) ||
		isNaN(blue) ||
		isNaN(alpha))
	{
		alert('Problem when setting fragtment color. One of the numbers you entered couldn\'t be converted to a float.'
		      + '(Using parseFloat() on it returned Nan)');
		return;
	}
	// else...
	
	// Each of them needs to be in the range of 0.0 to 1.0?
	// Yes. See https://thebookofshaders.com/02/. (Bullet 4.)
	
	var inputIsGood;
	if (isInclusivelyZeroToOne(red) &&
	    isInclusivelyZeroToOne(green) &&
		isInclusivelyZeroToOne(blue) &&
		isInclusivelyZeroToOne(alpha))
		inputIsGood = true;
	else
		inputIsGood = false;
	
	if (inputIsGood)
	{
		fragmentShaderProgram
		= "void main() { gl_FragColor = vec4("
		+ fragmentColorsAsString
		+ "); }";
	}
	else
	{
		alert("Some of your input was bad.\n"
		     + "Each number for the fragment color needs to be inclusively in the range of 0.0 and 1.0.\n"
			 + "(For example \"0.5, 0.5, 0.5, 1.0\" (a grayish color) or \"1.0, 1.0, 0.0, 1.0\" (full solid yellow).");
		return;
	}
	
    // Need to recompile or something? tbd
    shaderProgram = makeShaderProgram();
}

function isInclusivelyZeroToOne(number)
{
	if ((number >= 0.0) && (number <= 1.0))
		return true;
	else
		return false;
}

function setCameraPosition()
{
	var positionAsString = document.getElementById("setCameraPositionTextbox").value;

	var comma1Index = positionAsString.indexOf(",");
	var comma2Index = positionAsString.indexOf(",", comma1Index + 1);
	
	var positionXAsString = positionAsString.slice(0, comma1Index);
	var positionYAsString = positionAsString.slice(comma1Index + 1, comma2Index);
	var positionZAsString = positionAsString.slice(comma2Index + 1);
	
	// "string.slice()" will return an empty string if the indexStart is past the end of the string.
	// (( if (<such_and_such_string>.length === 0) then the string is an empty string. ))
	//
	// Also doing Number("") (a Number() conversion on an empty string) will return back 0.
	
	var translateAmounts = [ Number(positionXAsString), Number(positionYAsString), Number(positionZAsString) ];
	
	mat4.translate(viewMatrix, viewMatrix, translateAmounts);
}

function setCameraRotation()
{
    var angleAsString = document.getElementById("rotationRadiansTextbox").value;
    var axisAsString = document.getElementById("rotationAxisTextbox").value;
    
    // "angle" should just be a Number.
    // "axis" should be like "1, 0, 0" or "0, 1, 0", or "0, 0, 1".
    
    var angle = Number(angleAsString);
    if (isNaN(angle)) {
        alert("Problem. You entered something in the angular rotation amount (in radians) box, that evaluated as NaN (not a number).");
        return;
    }
    
    var comma1Index = axisAsString.indexOf(",");
    var comma2Index = axisAsString.indexOf(",", comma1Index + 1);
    var aroundXAsString = axisAsString.slice(0, comma1Index);
    var aroundYAsString = axisAsString.slice(comma1Index + 1, comma2Index);
    var aroundZAsString = axisAsString.slice(comma2Index + 1);
    var aroundX = Number(aroundXAsString);
    var aroundY = Number(aroundYAsString);
    var aroundZ = Number(aroundZAsString);
    if ( isNaN(aroundX) ||
         isNaN(aroundY) ||
         isNaN(aroundZ) ) {
        // First make sure that aroundX, aroundY, aroundZ are all numbers (not NaN).
        alert("Problem. around-x-axis or around-y-axis or around-z-axis was NaN. Two should be 0 and one should be 1. Try again.");
        return;
    }
    if (cameraRotationAxisValidityChecker(aroundX, aroundY, aroundZ) == false) {
        // Two should be 0 and one should be 1.
        alert("Problem. Specify a *single* axis, around which to do the rotation.");
        return;
    }
    
	mat4.rotate(viewMatrix, viewMatrix, angle, [aroundX, aroundY, aroundZ]);
}

function cameraRotationAxisValidityChecker(xIndicator, yIndicator, zIndicator)
{
    var isGood;
    
    if ( (xIndicator == 1  &&  yIndicator == 0  &&  zIndicator == 0) ||
         (xIndicator == 0  &&  yIndicator == 1  &&  zIndicator == 0) ||
         (xIndicator == 0  &&  yIndicator == 0  &&  zIndicator == 1) )
    {
        isGood = true;
    }
    else
    {
        isGood = false;
    }
    
    return isGood;
}



function drawScene()
{
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Perspective matrix.
	const fieldOfView = 45 * (Math.PI/180);
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const perspectiveMatrix = mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(perspectiveMatrix, fieldOfView, aspect, zNear, zFar);
	
	
	// mat4.rotate(viewMatrix, viewMatrix, rotAmountInRads, [aX, aY, aZ]);
	
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_objects_with_WebGL
	// mat4.rotate(viewMatrix, viewMatrix, rotaation_amount_in_radians, [x, x, x]);
	//   The last parameter tells it wich axis to rotate around.
	//   (It is [x, y, z].)
	//   (  [0, 0, 1]  will rotate it around the Z axis (that is straight from the above tutorial).
	//   And so [1, 0, 0] should rotate you around x,
	//   [0, 1, 0] should rotate you around y.
	//   Id assume anyways.
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		
		gl.vertexAttribPointer(programDetails.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programDetails.attribLocations.vertexPosition);
	}

	// Tell WebGL to use our program when drawing
	gl.useProgram(programDetails.program);
	
	// Set the shader uniforms	
	gl.uniformMatrix4fv(programDetails.uniformLocations.projectionMatrix, false, perspectiveMatrix);
	gl.uniformMatrix4fv(programDetails.uniformLocations.modelViewMatrix, false, viewMatrix);
	
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
}

function resetTriangles()
{
    vertices = [ ];
    vertexCount = 0;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
}


function resetCamera()
{
    viewMatrix = mat4.create();
}

function logVertices()
{
	for (var i = 0; i < vertices.length; i++)
	{
		if (i%3 == 0) {
			console.log("[");
			console.log(vertices[i]);
			console.log(", ");
		}
		if (i%3 == 1) {
			console.log(vertices[i]);
			console.log(", ");
		}
		if (i%3 == 2) {
			console.log(vertices[i]);
			console.log("]");
			if ((i+2) <= vertices.length) {  // If there is still more in the array,
				console.log(", ");
			}
		}
	}
	console.log("[END]");
}

function logVerticesSimpler()
{
    console.log(vertices);
}





function makeShaderProgram()
{
	const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderProgram);
	const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderProgram);

	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
		alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function loadShader(type, source)
{
	const shader = gl.createShader(type);

	// Send the source to the shader object
	gl.shaderSource(shader, source);

	// Compile the shader program
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

