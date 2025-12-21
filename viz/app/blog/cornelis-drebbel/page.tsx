import BlogLayout from "../BlogLayout";

export default function CornelisDrebbel() {
  return (
    <BlogLayout
      title="Cornelis Drebbel: The Dutch Alchemist Who Invented the Future"
      tag="Research"
      slug="cornelis-drebbel"
      date="December 2025"
      prevPost={{ href: "/blog/roadmap", title: "Translation Roadmap" }}
    >
      {/* Hero Image
          Source: Wikimedia Commons - https://commons.wikimedia.org/wiki/File:Cornelius_Drebbel_portrait_painted_1620s.jpg
          Or NPG D11140: https://www.npg.org.uk/collections/search/portrait/mw57508/Cornelis-Drebbel
      */}
      <figure style={{ margin: '0 0 40px 0' }}>
        <img
          src="/gallery/full/drebbel-portrait.jpg"
          alt="Portrait of Cornelis Drebbel, Dutch inventor and alchemist"
          style={{
            width: '100%',
            maxWidth: '500px',
            display: 'block',
            margin: '0 auto',
            borderRadius: '8px',
            border: '1px solid #e8e4dc'
          }}
        />
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: '#888',
          marginTop: '12px',
          textAlign: 'center',
        }}>
          Cornelis Drebbel (1572–1633). Engraving from the 1620s.
        </figcaption>
      </figure>

      <p style={{ marginBottom: '24px' }}>
        Earlier this year, I was synchronistically gifted a wooden submarine — a replica of Cornelis Drebbel&apos;s first functional sub.
        It sits on my desk as a reminder that the most important inventors are often the least remembered.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Drebbel is my favorite Dutch alchemist. He built the <strong>first cybernetic system</strong>, the <strong>first submarine</strong>,
        the <strong>first air conditioning</strong>, and a clock powered by atmospheric pressure that ran for decades without winding.
        He influenced Galileo, Francis Bacon, and the founders of the Royal Society. Shakespeare and Ben Jonson wrote plays inspired by his wizardry.
      </p>

      <p style={{ marginBottom: '24px' }}>
        No one knows about him.
      </p>

      <p style={{ marginBottom: '24px' }}>
        His book, <em>De Natura Elementorum</em>, was the first I translated and put online at{" "}
        <a href="https://sourcelibrary.org" style={{ color: '#9e4a3a' }}>SourceLibrary.org</a>.
        This essay is an attempt to restore him to his rightful place in the history of technology.
      </p>

      {/* Perpetui Mobilis Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        The Perpetui Mobilis: A Clock That Runs on Air
      </h2>

      {/* Perpetuum Mobile Image
          Source: Wikimedia Commons - https://commons.wikimedia.org/wiki/File:Drebbel-Clock.jpg
          Or: https://commons.wikimedia.org/wiki/File:1612_Perpetuum_Mobile.jpg
      */}
      <figure style={{ margin: '0 0 32px 0' }}>
        <img
          src="/gallery/full/drebbel-perpetuum-mobile.jpg"
          alt="Drebbel's Perpetuum Mobile clock"
          style={{
            width: '100%',
            maxWidth: '600px',
            display: 'block',
            margin: '0 auto',
            borderRadius: '8px',
            border: '1px solid #e8e4dc'
          }}
        />
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: '#888',
          marginTop: '12px',
          textAlign: 'center',
        }}>
          The Perpetui Mobilis as depicted in Drebbel&apos;s time. The device used daily fluctuations in atmospheric pressure to power a clock indefinitely.
        </figcaption>
      </figure>

      <p style={{ marginBottom: '24px' }}>
        In 1604, Drebbel unveiled what he called the <em>Perpetui Mobilis</em> — and it made him famous across Europe overnight.
      </p>

      <p style={{ marginBottom: '24px' }}>
        The device was an astronomical clock that displayed the date, time, and phases of the moon. It ran without winding,
        seemingly forever. Contemporary observers were baffled. Drebbel, speaking like the alchemist he was,
        claimed to have harnessed the &quot;fiery spirit of the air.&quot;
      </p>

      <p style={{ marginBottom: '24px' }}>
        We now understand what he discovered: <strong>changes in atmospheric pressure and temperature</strong> could be
        converted into mechanical motion. As the air expanded and contracted with daily weather fluctuations,
        it drove the clock&apos;s mechanism. Drebbel had built the ancestor of the modern{" "}
        <a href="https://en.wikipedia.org/wiki/Atmos_clock" style={{ color: '#9e4a3a' }}>Atmos clock</a>.
      </p>

      <p style={{ marginBottom: '24px' }}>
        He built as many as eighteen of these devices. The most famous, the <em>Eltham Perpetuum</em>, was made for King James I
        and became legendary throughout Europe. Another went to Holy Roman Emperor Rudolf II in Prague.
      </p>

      <div style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: 'Newsreader, Georgia, serif',
          fontSize: '18px',
          fontStyle: 'italic',
          color: '#333',
          margin: 0,
        }}>
          &quot;Even if the Perpetuum Mobile was only a simple air thermoscope, or at best a crude baroscope,
          Drebbel invested it with great mystery and great value.&quot;
        </p>
      </div>

      {/* Thermostat Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        The First Cybernetic System: A Self-Governing Oven
      </h2>

      <p style={{ marginBottom: '24px' }}>
        Before Norbert Wiener coined the term &quot;cybernetics&quot; in 1948, before James Watt&apos;s steam governor,
        before any systematic theory of feedback control — there was Drebbel&apos;s egg incubator.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Around 1598, Drebbel patented a <strong>self-regulating oven</strong> for hatching eggs and drying tobacco.
        The device maintained a constant temperature without human intervention. It was, as historians of technology
        have noted, &quot;the first feedback system invented since antiquity.&quot;
      </p>

      {/* Thermostat/Furnace Image
          Source: Use alchemical laboratory image as context
          Or search for Drebbel furnace diagrams at drebbel.net
      */}
      <figure style={{ margin: '0 0 32px 0' }}>
        <img
          src="/gallery/full/alchemical-lab.jpg"
          alt="Alchemical laboratory with furnaces"
          style={{
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #e8e4dc'
          }}
        />
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: '#888',
          marginTop: '12px',
          textAlign: 'center',
        }}>
          An alchemical laboratory with furnaces. Drebbel&apos;s self-regulating oven used similar equipment to achieve automatic temperature control.
        </figcaption>
      </figure>

      <p style={{ marginBottom: '24px' }}>
        How did it work? An L-shaped glass tube filled with alcohol and mercury sat inside the oven.
        A metal rod floated on the mercury. When the temperature rose too high, the expanding alcohol
        pushed up the mercury, lifting the rod, which lowered a damper to cut off air to the fire.
        When the oven cooled, the process reversed.
      </p>

      <p style={{ marginBottom: '24px' }}>
        This is the essential logic of all feedback systems: <strong>measure the output, compare it to a setpoint,
        adjust the input</strong>. Drebbel had invented the thermostat — and with it, the conceptual foundation
        for automation itself.
      </p>

      <div style={{
        background: '#1a1612',
        color: '#fff',
        padding: '32px',
        borderRadius: '8px',
        marginTop: '32px',
        marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '24px',
          fontWeight: 400,
          marginBottom: '16px',
          lineHeight: 1.4,
        }}>
          &quot;Drebbel&apos;s thermostatic furnace has been called the first feedback system invented since antiquity.&quot;
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
        }}>
          — Encyclopedia.com, &quot;Development of the Self-Regulating Oven&quot;
        </p>
      </div>

      {/* Submarine Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        The Submarine: Sailing Beneath the Thames
      </h2>

      {/* Submarine Image
          Source: There are no contemporary images of Drebbel's submarine.
          Modern reconstructions: https://commons.wikimedia.org/wiki/File:Drebbel%27s_submarine.jpg
          Or use photo of replica near Richmond Bridge, London
      */}
      <figure style={{ margin: '0 0 32px 0' }}>
        <img
          src="/gallery/full/drebbel-submarine.jpg"
          alt="Reconstruction of Drebbel's submarine"
          style={{
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #e8e4dc'
          }}
        />
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: '#888',
          marginTop: '12px',
          textAlign: 'center',
        }}>
          A modern reconstruction of Drebbel&apos;s submarine. The original was covered in greased leather over a wooden frame. No contemporary images survive.
        </figcaption>
      </figure>

      <p style={{ marginBottom: '24px' }}>
        Between 1620 and 1624, Drebbel built three increasingly ambitious submarines and tested them in the River Thames.
        The vessels were wooden frames covered in greased leather, with a watertight hatch, a rudder, and oars.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Dive control was ingenious: large pigskin bladders beneath the rowers&apos; seats were connected to the outside water.
        To submerge, the crew untied ropes holding the bladders closed, allowing them to fill with water.
        To surface, they squeezed the bladders flat, expelling the water.
      </p>

      <p style={{ marginBottom: '24px' }}>
        The third and largest model had six oars and could carry <strong>sixteen passengers</strong>.
        Drebbel demonstrated it to King James I and thousands of Londoners. The submarine traveled from
        Westminster to Greenwich and back — a journey of several miles — staying submerged for three hours
        at depths of 12 to 15 feet.
      </p>

      <p style={{ marginBottom: '24px' }}>
        <strong>James I himself went aboard for a test dive</strong>, making him the first monarch in history to travel underwater.
      </p>

      <div style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          letterSpacing: '0.05em',
          color: '#888',
          marginBottom: '16px',
        }}>
          THE OXYGEN MYSTERY
        </p>
        <p style={{
          fontFamily: 'Newsreader, Georgia, serif',
          fontSize: '18px',
          color: '#333',
          margin: 0,
        }}>
          How did sixteen people breathe underwater for three hours in a sealed vessel?
          Drebbel claimed to carry a &quot;quintessence of air&quot; that refreshed the atmosphere inside.
          Robert Boyle later investigated but could not penetrate the secret.
          Modern historians believe Drebbel may have generated oxygen by heating saltpeter (potassium nitrate) —
          <strong>150 years before oxygen was officially &quot;discovered.&quot;</strong>
        </p>
      </div>

      {/* Air Conditioning Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        The First Air Conditioning: Turning Summer into Winter
      </h2>

      <p style={{ marginBottom: '24px' }}>
        In the summer of 1620, Drebbel staged another demonstration for King James — this time in Westminster Hall,
        the largest enclosed space in the British Isles, with a vaulted ceiling stretching 332 feet.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Using troughs filled with snow, water, salt, and potassium nitrate, Drebbel created a zone of frigid air
        inside the sweltering hall. The chemical mixture drew heat from the surrounding atmosphere —
        an application of what we now call an <strong>endothermic reaction</strong>.
      </p>

      <p style={{ marginBottom: '24px' }}>
        The king walked through the chilled zone and, according to accounts, fled shivering from the demonstration.
        Drebbel had &quot;turned summer into winter&quot; — creating the first documented air conditioning system,
        three centuries before Willis Carrier.
      </p>

      {/* Optics Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        Lenses, Microscopes, and the Tools of Discovery
      </h2>

      <p style={{ marginBottom: '24px' }}>
        Around 1600, Drebbel visited Middelburg, the spectacle-making center of the Netherlands,
        where he learned lens grinding from Hans Lippershey and Zacharias Janssen — the men credited with inventing the telescope.
      </p>

      <p style={{ marginBottom: '24px' }}>
        With this knowledge, Drebbel developed:
      </p>

      <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
        <li style={{ marginBottom: '12px' }}>
          <strong>An automatic lens-grinding machine</strong> for precision optics
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>A compound microscope</strong> with two convex lenses (documented by 1619)
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Improved telescopes</strong> using the Keplerian design
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>A camera obscura</strong> and <strong>magic lantern</strong> for projecting images
        </li>
      </ul>

      <p style={{ marginBottom: '24px' }}>
        Christiaan Huygens, the great Dutch scientist, credited Drebbel with inventing the compound microscope.
        In 1624, Galileo saw one of Drebbel&apos;s microscopes exhibited in Rome and built his own improved version.
      </p>

      <p style={{ marginBottom: '24px' }}>
        The telescope used by <strong>Galileo to discover the moons of Jupiter</strong> may have incorporated
        lenses from Drebbel&apos;s workshop — though the exact provenance remains debated by historians.
      </p>

      {/* Scarlet Dye Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        The Secret of Scarlet: A Chemical Revolution
      </h2>

      <p style={{ marginBottom: '24px' }}>
        Like many alchemists, Drebbel worked extensively with colored substances — seeking the Philosopher&apos;s Stone,
        whose production was said to pass through stages marked by color changes.
      </p>

      <p style={{ marginBottom: '24px' }}>
        While making a colored liquid for a thermometer, Drebbel accidentally dropped a flask of <em>aqua regia</em>
        (a mixture of nitric and hydrochloric acids) onto a tin windowsill. The tin dissolved into the liquid,
        and when combined with cochineal dye, it produced a <strong>brilliant crimson</strong> far more vivid
        than any red previously known.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Drebbel had discovered the <strong>tin mordant</strong> — a breakthrough in textile chemistry that
        would transform the European dye industry. The resulting color, called &quot;Kuffler&apos;s color,&quot;
        &quot;Dutch scarlet,&quot; or &quot;Bow dye&quot; (after the London workshop his family later established),
        became the most fashionable red in Europe, reserved for royal cloth.
      </p>

      {/* Theater Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        Wizard of the Stage: Shakespeare, Jonson, and Prospero
      </h2>

      <p style={{ marginBottom: '24px' }}>
        Drebbel&apos;s inventions made him a valuable asset for the lavish court masques performed for King James.
        He created special effects — <strong>thunder, lightning, storms, and ghostly projections</strong> — for
        the productions of Ben Jonson and William Shakespeare.
      </p>

      <p style={{ marginBottom: '24px' }}>
        He designed mechanical stage props, fountains, and moving figures. His magic lantern projected
        apparitions onto smoke. His fireworks lit up the night sky. Contemporary audiences saw him as
        something between an engineer and a sorcerer.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Scholars have suggested that Drebbel inspired the character of <strong>Prospero</strong> in Shakespeare&apos;s
        <em>The Tempest</em> (1611) — the exiled duke who commands spirits and creates storms through his
        mastery of hidden arts. The play was written during Drebbel&apos;s years at the English court,
        when his fame was at its height.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Ben Jonson satirized the &quot;vulgar mechanick&quot; in his plays, but also relied on his technical genius
        for the spectacular effects that made the Jacobean masques legendary.
      </p>

      {/* Francis Bacon Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        Francis Bacon&apos;s Vision: Drebbel and Salomon&apos;s House
      </h2>

      <figure style={{ margin: '0 0 32px 0' }}>
        <img
          src="/gallery/full/francis-bacon.jpg"
          alt="Portrait of Francis Bacon"
          style={{
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #e8e4dc'
          }}
        />
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: '#888',
          marginTop: '12px',
          textAlign: 'center',
        }}>
          Francis Bacon, whose utopian vision of scientific progress was shaped by Drebbel&apos;s inventions.
        </figcaption>
      </figure>

      <p style={{ marginBottom: '24px' }}>
        In 1626, Francis Bacon published <em>New Atlantis</em>, describing a utopian society governed by
        a research institution called <strong>Salomon&apos;s House</strong>. This fictional academy —
        often credited as the inspiration for the Royal Society — possessed technologies that read like
        a catalog of Drebbel&apos;s inventions:
      </p>

      <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
        <li style={{ marginBottom: '12px' }}>
          <strong>Submarines</strong> for underwater exploration
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Cooling chambers</strong> for preserving food
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Perpetual motion engines</strong> harnessing natural forces
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Optical instruments</strong> for extending human vision
        </li>
      </ul>

      <p style={{ marginBottom: '24px' }}>
        The scholar Rosalie Colie demonstrated in her 1955 study that Bacon almost certainly drew on
        Drebbel&apos;s work when imagining the technologies of his ideal society. Drebbel had demonstrated
        his submarine to James I in 1620; Bacon was at court and knew Drebbel personally.
      </p>

      <p style={{ marginBottom: '24px' }}>
        <strong>The founding vision of modern science was shaped, in part, by a Dutch alchemist
        whom history forgot.</strong>
      </p>

      {/* Royal Society Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        The Royal Society and Robert Boyle
      </h2>

      <p style={{ marginBottom: '24px' }}>
        When the Royal Society was founded in 1660, its members knew of Drebbel&apos;s work.
        Robert Boyle — the &quot;father of modern chemistry&quot; — held Drebbel in high esteem,
        calling him a &quot;deservedly famous mechanician and chymist.&quot;
      </p>

      <p style={{ marginBottom: '24px' }}>
        Boyle investigated Drebbel&apos;s submarine and tried to understand how the crew had breathed
        underwater for hours. He could not penetrate the secret, but noted that Drebbel clearly understood
        something profound about the &quot;complex nature of the atmosphere&quot; — decades before the
        discovery of oxygen.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Drebbel&apos;s work on pneumatics, feedback control, and chemical processes anticipated the research
        programs that Boyle, Hooke, and their colleagues would pursue at the Royal Society.
      </p>

      {/* Prague Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        The Emperor&apos;s Alchemist: Prague and Rudolf II
      </h2>

      <p style={{ marginBottom: '24px' }}>
        In October 1610, Drebbel and his family traveled to Prague at the invitation of Holy Roman Emperor Rudolf II —
        the great patron of alchemy, astronomy, and the occult arts. Rudolf&apos;s court was home to
        Tycho Brahe, Johannes Kepler, and dozens of alchemists seeking the Philosopher&apos;s Stone.
      </p>

      <p style={{ marginBottom: '24px' }}>
        Drebbel demonstrated his <em>Perpetui Mobilis</em>, constructed pumps for mining operations,
        and pursued alchemical research. But when Rudolf was stripped of power by his brother Matthias in 1611,
        Drebbel was imprisoned for about a year.
      </p>

      <p style={{ marginBottom: '24px' }}>
        After Rudolf&apos;s death in 1612, Drebbel was released and returned to London in 1613,
        where he would spend the rest of his life.
      </p>

      {/* Final Years Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        Final Years: The Fens and the Alehouse
      </h2>

      <p style={{ marginBottom: '24px' }}>
        Drebbel&apos;s final years were marked by declining fortune. By 1630, he was involved in planning
        the <strong>drainage of the Fens</strong> around Cambridge — the vast marshlands that would be
        reclaimed under the direction of the Dutch engineer Cornelius Vermuyden.
      </p>

      <p style={{ marginBottom: '24px' }}>
        He died on November 7, 1633, in relative obscurity, running an alehouse in London.
        The wizard who had entertained kings and inspired utopias ended his days in poverty.
      </p>

      <p style={{ marginBottom: '24px' }}>
        But his legacy endured through his family. His daughters and sons-in-law, the Kufflers,
        established dye works across Europe using his scarlet recipe. The &quot;Bow dye&quot; remained
        a family secret for generations.
      </p>

      {/* Legacy Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        Why Drebbel Matters: Recovering a Lost Polymath
      </h2>

      <div style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          letterSpacing: '0.05em',
          color: '#888',
          marginBottom: '16px',
        }}>
          DREBBEL&apos;S FIRSTS
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { year: '1598', invention: 'First thermostat / feedback control system' },
            { year: '1604', invention: 'First atmospheric pressure clock (Perpetui Mobilis)' },
            { year: '1619', invention: 'First compound microscope (documented)' },
            { year: '1620', invention: 'First navigable submarine' },
            { year: '1620', invention: 'First air conditioning demonstration' },
            { year: 'c.1620', invention: 'Discovery of tin mordant for scarlet dye' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '12px',
              background: '#fdfcf9',
              borderRadius: '4px',
            }}>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: '#9e4a3a',
                marginBottom: '4px',
              }}>{item.year}</p>
              <p style={{
                fontFamily: 'Newsreader, Georgia, serif',
                fontSize: '14px',
                color: '#333',
                margin: 0,
              }}>{item.invention}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={{ marginBottom: '24px' }}>
        Cornelis Drebbel represents a type of inventor that our modern categories struggle to contain.
        He was an alchemist who built practical machines. A showman who made genuine discoveries.
        A court entertainer whose work anticipated cybernetics, submarine warfare, and climate control.
      </p>

      <p style={{ marginBottom: '24px' }}>
        His contemporaries couldn&apos;t decide whether he was a genius or a charlatan.
        He refused to publish his methods, preferring mystery to documentation.
        He presented himself as a wizard rather than a philosopher — and paid the price in historical memory.
      </p>

      <p style={{ marginBottom: '24px' }}>
        But the evidence of his inventions survives. The testimony of Boyle, Bacon, and Huygens survives.
        And now, for the first time, his own words are available in English at{" "}
        <a href="https://sourcelibrary.org" style={{ color: '#9e4a3a' }}>SourceLibrary.org</a>.
      </p>

      <div style={{
        background: '#1a1612',
        color: '#fff',
        padding: '32px',
        borderRadius: '8px',
        marginTop: '48px',
        marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '24px',
          fontWeight: 400,
          marginBottom: '16px',
          lineHeight: 1.4,
        }}>
          &quot;Public opinion of Drebbel was divided. While some thought of him as a genius inventor,
          others dismissed him as a mere court entertainer, a dabbler in occultism, and a &apos;vulgar mechanick&apos;
          without the right education or scientific rigour.&quot;
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
        }}>
          Four hundred years later, the inventions speak for themselves.
        </p>
      </div>

      {/* Sources Section */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1a1612',
        marginTop: '48px',
        marginBottom: '24px',
      }}>
        Sources &amp; Further Reading
      </h2>

      <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
        <li style={{ marginBottom: '12px' }}>
          <a href="https://archive.org/details/bub_gb_7c7pB61grDgC" style={{ color: '#9e4a3a' }}>
            Drebbel, <em>Tractatus Duo: De Natura Elementorum &amp; De Quinta Essentia</em> (1628)
          </a> — Internet Archive
        </li>
        <li style={{ marginBottom: '12px' }}>
          Colie, Rosalie. &quot;Cornelis Drebbel and Salomon de Caus: Two Jacobean Models for Salomon&apos;s House.&quot;
          <em>Huntington Library Quarterly</em> 18.3 (1955): 245-260.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <a href="https://www.encyclopedia.com/science/encyclopedias-almanacs-transcripts-and-maps/development-self-regulating-oven" style={{ color: '#9e4a3a' }}>
            &quot;Development of the Self-Regulating Oven&quot;
          </a> — Encyclopedia.com
        </li>
        <li style={{ marginBottom: '12px' }}>
          <a href="https://drebbel.net" style={{ color: '#9e4a3a' }}>
            Drebbel.net
          </a> — Comprehensive archive maintained by Drebbel&apos;s descendants
        </li>
        <li style={{ marginBottom: '12px' }}>
          <a href="https://www.britannica.com/biography/Cornelis-Jacobszoon-Drebbel" style={{ color: '#9e4a3a' }}>
            Britannica: Cornelis Drebbel
          </a>
        </li>
        <li style={{ marginBottom: '12px' }}>
          <a href="https://mysteriousmasterpiece.com/cornelis-drebbels-perpetuum-mobile-in-the-linder-gallery/" style={{ color: '#9e4a3a' }}>
            &quot;Cornelis Drebbel&apos;s Perpetuum Mobile in the Linder Gallery&quot;
          </a> — The Mysterious Masterpiece
        </li>
      </ul>

      {/* CTA */}
      <div style={{
        background: '#fdfcf9',
        border: '1px solid #e8e4dc',
        borderRadius: '8px',
        padding: '32px',
        marginTop: '48px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '24px',
          color: '#1a1612',
          marginBottom: '16px',
        }}>
          Read Drebbel&apos;s original work in English translation
        </p>
        <a
          href="https://sourcelibrary.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            background: '#9e4a3a',
            padding: '12px 32px',
            borderRadius: '4px',
            textDecoration: 'none',
            marginRight: '12px',
          }}
        >
          Visit Source Library
        </a>
        <a
          href="https://www.ancientwisdomtrust.org/become-a-patron"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#9e4a3a',
            background: 'transparent',
            padding: '12px 32px',
            borderRadius: '4px',
            textDecoration: 'none',
            border: '1px solid #9e4a3a',
          }}
        >
          Support This Work
        </a>
      </div>
    </BlogLayout>
  );
}
