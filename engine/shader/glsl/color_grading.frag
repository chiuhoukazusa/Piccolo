#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);

    highp vec4 color       = subpassLoad(in_color).rgba;

    highp float sizey = float(lut_tex_size.y);
    highp float sizex = float(lut_tex_size.x);

    highp float blue = color.b * (sizey - 1.0);
    highp float f_blue = floor(blue) / sizey;
    highp float c_blue = ceil(blue) / sizey;

    highp float green = color.g * (sizey - 1.0);
    highp float f_green = floor(green) / sizey;
    highp float c_green = ceil(green) / sizey;

    highp float red = color.r * (sizey - 1.0);
    highp float f_red = floor(red) / sizex;
    highp float c_red = ceil(red) / sizex;

    highp vec3 blue1_green1_red1_sample = texture(color_grading_lut_texture_sampler, vec2(f_red + f_blue, f_green)).rgb;
    highp vec3 blue1_green1_red2_sample = texture(color_grading_lut_texture_sampler, vec2(c_red + f_blue, f_green)).rgb;
    highp vec3 blue1_green1_red_interpolated = mix(blue1_green1_red1_sample, blue1_green1_red2_sample, fract(red));

    highp vec3 blue1_green2_red1_sample = texture(color_grading_lut_texture_sampler, vec2(f_red + f_blue, c_green)).rgb;
    highp vec3 blue1_green2_red2_sample = texture(color_grading_lut_texture_sampler, vec2(c_red + f_blue, c_green)).rgb;
    highp vec3 blue1_green2_red_interpolated = mix(blue1_green2_red1_sample, blue1_green2_red2_sample, fract(red));

    highp vec3 blue1_gr_interpolated = mix(blue1_green1_red_interpolated, blue1_green2_red_interpolated, fract(green));

    highp vec3 blue2_green1_red1_sample = texture(color_grading_lut_texture_sampler, vec2(f_red + c_blue, f_green)).rgb;
    highp vec3 blue2_green1_red2_sample = texture(color_grading_lut_texture_sampler, vec2(c_red + c_blue, f_green)).rgb;
    highp vec3 blue2_green1_red_interpolated = mix(blue2_green1_red1_sample, blue2_green1_red2_sample, fract(red));

    highp vec3 blue2_green2_red1_sample = texture(color_grading_lut_texture_sampler, vec2(f_red + c_blue, c_green)).rgb;
    highp vec3 blue2_green2_red2_sample = texture(color_grading_lut_texture_sampler, vec2(c_red + c_blue, c_green)).rgb;
    highp vec3 blue2_green2_red_interpolated = mix(blue2_green2_red1_sample, blue2_green2_red2_sample, fract(red));

    highp vec3 blue2_gr_interpolated = mix(blue2_green1_red_interpolated, blue2_green2_red_interpolated, fract(green));

    highp vec3 colorfin = mix(blue1_gr_interpolated, blue2_gr_interpolated, fract(blue));

    out_color = vec4(colorfin, color.a);
}