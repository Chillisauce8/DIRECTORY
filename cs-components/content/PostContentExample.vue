<template>
  <div class="POST post-content">

    <template v-for="n in 5" :key="n" >
      <SplitBox :content="{title: 'TEST TITLE', text: 'TEST TEXT', image: [{image: {id: '4abcdeafee33ea0033d6'}}, {image: {id: '63ebe754da9fa50fd75e77b3'}}]}"/>
    </template>

    <ContentBreak title="Here is a break title" text=" While playing through a song I had written some years before, I started
        picking it apart to see how it correlated with the theory I was
        learning. " />

    <ImageWrapper :images="[{cloudinaryId: '4abcdeafee33ea0033d6'}, {cloudinaryId: '63ebe754da9fa50fd75e77b3'}]" :width="500" :height="300"/>
    <ImageWrapper cloudinaryId='63ebe754da9fa50fd75e77b3' :width="500" :height="300"/>

    <section class="W1 Copy">
      <h2>HEADINGS</h2>
      <h1 class="h0">h0 pixels font</h1>
      <h1>h1 pixels font</h1>
      <h2>h2 pixels font</h2>
      <h3>h3 pixels font</h3>
      <h4>h4 pixels font</h4>
      <h5>h5 pixels font</h5>
      <h6>h6 pixels font</h6>
      <p class="h7">h7 pixels font</p>
      <p class="h8">h8 pixels font</p>
      <p class="h9">h9 pixels font</p>
      <p class="h10">h10 pixels font</p>

      <h2>GENERAL BLOCK LEVEL ELEMENTS</h2>

      <h3>Paragraph & Links</h3>
      <p>
        This is a single paragraph. Well, not quite,
        <a href="#">since this is not really quoted text</a>, text, but I hope
        you understand the point. After all, this page does not use HTML markup
        very normally anyway.
      </p>

      <p>
        While playing through a song I had written some years before, I started
        picking it apart to see how it correlated with the theory I was
        learning. I had composed the melody without any thought to what the
        specific notes were, but as I started to transcribe them, a pattern
        quickly emerged: all the B’s and E’s were flat and the rest of the notes
        were natural. Lo and behold, long before my music theory studies began,
        I had written a song in B♭ major. My ears already knew how the major
        scales worked even if my brain didn’t. (If you know how “do re mi fa so
        la ti do” is supposed to sound tonally, then your ears know, too.)
      </p>

      <h4>Code</h4>

      <p>
        We start with a paragraph and then
        <code>This is Wrapped on a CODE tag</code> to show contrast
      </p>

      <h4>Mark</h4>

      <p>
        We start with a paragraph and then
        <mark>This is Wrapped on a MARK tag</mark> to show contrast
      </p>

      <h4>EM</h4>
      <p>
        We start with a paragraph and then
        <em>This is Wrapped on a EM tag</em> to show contrast
      </p>

      <i>I</i>
      <p>
        We start with a paragraph and then
        <i>This is Wrapped on a I tag</i> to show contrast
      </p>

      <h4>STRONG</h4>
      <p>
        We start with a paragraph and then
        <strong>This is Wrapped on a STRONG tag</strong> to show contrast
      </p>

      <b>B</b>
      <p>
        We start with a paragraph and then
        <b>This is Wrapped on a B tag</b> to show contrast
      </p>

      <h2>QUOTES</h2>

      <h3>Blockquote With Author</h3>
      <blockquote>
        <p>
          This is a This is in an I tag block quotation containing a single
          paragraph. Well, not quite, since this is not really quoted text, but
          I hope you understand the point. After all, this page does not use
          HTML markup very normally anyway.
        </p>

        <div class="author">Oliver Twist</div>
      </blockquote>

      <h3>Q</h3>
      <p>
        We start with a paragraph and then
        <q>This is Wrapped on a Q tag</q> to show contrast
      </p>

      <h2>LISTS</h2>

      <p>
        This is a paragraph BEFORE an <strong>unordered</strong> list
        (<code>ul</code>). Note that the spacing Between a paragraph and a list
        before or after that is hard to tune in a user style sheet. You can't
        guess which paragraphs are logically related to a list, e.g. as a list
        header.
      </p>

      <h3>Unordered List</h3>
      <p>This is a paragraph BEFORE an <strong>unordered</strong> list</p>
      <ul>
        <li>One.</li>
        <li>Two.</li>
        <li>
          Three. Well, probably this list item should be longer. Note that for
          short items lists look better if they are compactly presented, whereas
          for long items, it would be better to have more vertical spacing
          Between items.
        </li>
        <li>
          four. This is the last item in this list Let us terminate the list now
          without making any more fuss about it.
        </li>
      </ul>

      <p>This is a paragraph AFTER an <strong>unordered</strong> list</p>

      <h3>Ordered List</h3>
      <p>This is a paragraph BEFORE an <strong>ordered</strong> list</p>
      <ol>
        <li>One.</li>
        <li>two.</li>
        <li>
          Three. Well, probably this list item should be longer. Note that if
          items are short, lists look better if they are compactly presented,
          whereas for long items, it would be better to have more vertical
          spacing Between items.
        </li>
        <li>
          Four. This is the last item in this list. Let us terminate the list
          now without making any more fuss about it.
        </li>
        <li>five</li>
        <li>Six</li>
        <li>Seven</li>
        <li>Eight</li>
        <li>Nine</li>
        <li>Ten</li>
        <li>Eleven</li>
      </ol>
      <p>This is a paragraph AFTER an <strong>ordered</strong> list</p>
      <h3>Definition List</h3>
      <p>This is a paragraph BEFORE an <strong>definition</strong> list</p>
      <dl>
        <dt>Definition Term 1</dt>
        <dd>Definition Definition 1</dd>
        <dd>DD 2</dd>
        <dd>
          DD 3 - The part of the Internet that contains websites and web pages.
          The part of the Internet that contains websites and web pages
        </dd>
        <dd>
          DD 4 The part of the Internet that contains websites and web pages
        </dd>
        <dt>Definition Term 2</dt>
        <dd>
          DD The part of the Internet that contains websites and web pages
        </dd>
        <dd>
          DD The part of the Internet that contains websites and web pages
        </dd>
        <dd>
          DD The part of the Internet that contains websites and web pages
        </dd>
        <dd>DDThe part of the Internet that contains websites and web pages</dd>
        <dt>Definition Term 3</dt>
        <dd>DD A technology to make HTML look better</dd>
      </dl>
      <p>This is a paragraph AFTER an <strong>definition</strong> list</p>
    </section>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
</style>
