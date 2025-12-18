import React from 'react';

const WhyChooseUs = () => {
  const features = [
    {
      img: 'https://ulcdn.universityliving.com/files/1739276243125searchoptimized2.gif?w=1920',
      title: 'Search - Compare - Relax',
      description:
        'Choose from 2 Mn 100% verified student rooms near the university & compare between the best options.',
    },
    {
      img: 'https://ulcdn.universityliving.com/files/1739276850672easyoptimized.gif?w=1920',
      title: 'Easy Peasy',
      description:
        'Instantly book the room in a matter of minutes. Save your time for more important things (Netflix).',
    },
    {
      img: 'https://ulcdn.universityliving.com/files/1739277040025priceoptimized.gif?w=1920',
      title: 'Lowest Price Guarantee',
      description:
        'We keep our promises. Grab the best offers along with the lowest price promise.',
      link: {
        url: '/terms-and-conditions#price',
        text: 'Terms & Conditions',
      },
    },
  ];

  return (
    <section className="relative w-full h-full odd-even-bg-color">
      <img
        alt="Why choose us"
        title="Why choose us"
        loading="lazy"
        width="2000"
        height="231"
        decoding="async"
        className="absolute bottom-0 w-full"
        style={{ color: 'transparent' }}
        src="https://cdn.universityliving.com/files/1735895442977wave_pattern.webp?w=1920"
      />
      <div className="relative lg:container pt-8 sm:pt-10 sm:pb-12">
        <div className="p-4 text-center items-center flex flex-col py-4">
          <h2 className="w-full mb-1 font-bold text-2xl md:text-[32px]">Why choose us?</h2>
          <h3 className="md:text-sm text-xs pt-3 text-contrast-high text-center">
            Discover why students choose us for their perfect stay, with features that set us apart in the most popular cities
          </h3>
        </div>

        <div className="pb-3 sm:pb-0 flex lg:justify-center overflow-x-auto no-scrollbar mt-3 sm:mt-7 snap-x snap-mandatory">
          <div className="px-4 lg:px-0 flex items-center gap-3 sm:gap-11">
            {features.map((item, index) => (
              <div
                key={index}
                className="relative transition h-full w-52 md:w-[17rem] flex flex-col items-center text-center gap-2 snap-center"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  title={item.title}
                  loading="lazy"
                  width="64"
                  height="64"
                  decoding="async"
                  className="object-cover mb-1"
                  style={{ color: 'transparent' }}
                />
                <h4 className="text-base lg:text-lg font-medium">{item.title}</h4>
                <p className="text-xs font-normal text-gray-600">{item.description}</p>
                {item.link && (
                  <a
                    className="content-font text-sm underline font-normal text-orange-extreme"
                    rel="noopener noreferrer"
                    target="_blank"
                    href={item.link.url}
                  >
                    {item.link.text}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
