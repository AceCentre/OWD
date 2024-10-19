// next.config.js
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/@ant-design\/icons/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });

    return config;
  },
};
