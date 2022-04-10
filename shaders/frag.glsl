
#version 330 core

uniform float u_Time;

varying vec3 colortest;

colortest={1,1,1}

out vec4 color;

#define PI 3.142857
float circle(vec2 _st,float radius){
    return 1.-smoothstep(radius-.05,radius,length(vec2(.5)-_st));
}
void main()
{
    vec2 uv=gl_FragCoord.xy/50.;
    float t=u_Time,// insert time here
    x_offset=-cos(mod(t,PI)),
    y_offset=-cos(mod(t-PI/2.,PI));
    
    vec2 i=step(1.,mod(uv,2.));
    float x_f=step(0.,x_offset)*(x_offset*(1.+2.*(i.y-1.))),
    y_f=step(0.,y_offset)*(y_offset*(1.+2.*(i.x-1.))),
    c=1.-circle(fract(uv+vec2(x_f,y_f)),.3);
    color=vec4(c,c,.2,1.);
    gl_FragColor=colortest,1;
}