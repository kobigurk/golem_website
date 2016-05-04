window.Tangents = window.Tangents || {};

(function() {

    function Tan() {}

    Tan.prototype.events = {
        resize: function() {
            Tangents.resizeCanvas();
            Tangents.setRatio();

            clearTimeout(Tangents.timeouts.resize);

            Tangents.timeouts.resize = setTimeout(function() {
                Tangents.clearStage(function() {
                    Tangents.addCircles();
                });
            }, Tangents.options.timeouts.resize);
        }
    };

    Tan.prototype.config = function() {
        if (!this.stage || !this.canvas) { return; }

        createjs.Ticker.setFPS(this.options.fps);
        createjs.Touch.enable(this.stage);

        this.stage.enableDOMEvents(true);
        this.stage.enableMouseOver(10);

        createjs.Ticker.addEventListener('tick', this.tick);

        this.canvas.style.backgroundColor = this.options.colors.canvas;

        this.resizeCanvas();
        this.setRatio();
    };

    Tan.prototype.resizeCanvas = function() {
        if (!this.canvas) { return; }

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    };

    Tan.prototype.setRatio = function() {
        this.ratioX = window.innerWidth / 1680;
        this.ratioY = window.innerHeight / 1050;
        this.ratio = Math.min(this.ratioX, this.ratioY);
    };

    Tan.prototype.initialize = function(opt) {
        var self = this;

        var options = opt || {},
            defaults = {
                fps: 60,
                colors: {
                    canvas: 'rgba(28, 31, 43, 1)',
                    colorDark: 'rgba(28, 31, 43, 1)',
                    colorDarkOpacity: 'rgba(28, 31, 43, 0.6)',
                    colorLight: 'rgba(182, 111, 111, 1)',
                    colorLightOpacity: 'rgba(182, 111, 111, 0.6)'
                },
                scale: {
                    max: 0.1,
                    min: 0.15
                },
                fractionalDigits: 5,
                positions: {
                    x: {
                        max: 5,
                        min: 5
                    },
                    y: {
                        max: 5,
                        min: 5
                    }
                },
                animationPaused: false,
                easing: createjs.Ease.backInOut,
                speed: 800,
                ratio: 0.2,
                timeouts: {
                    resize: 500
                }
            };

        this.options = $.extend(defaults, options);

        this.timeouts = {
            resize: null
        };

        this.linesCreated = false;

        this.addEvent($(window), 'resize', 'resize');
        this.getStartData('data.json', function() {
            self.prepareScene();
        });
    };

    Tan.prototype.addEvent = function(el, event, handle) {
        el.on(event, this.events[handle]);
    };

    Tan.prototype.removeEvent = function(el, event, handle) {
        el.off(event, this.events[handle]);
    };

    Tan.prototype.getStartData = function(url, callback) {
        var self = this;

        $.get('data.json').success(function(response) {
            self.data = response;
            callback();
        });
    };

    Tan.prototype.clearStage = function(callback) {
        if (!this.stage) { return; }

        this.stage.removeAllChildren();
        this.stage.update();

        this.relations = [];
        this.circles = null;
        this.lines = null;
        this.linesCreated = false;

        callback();
    };

    Tan.prototype.addCircles = function() {
        if (!this.data) { return; }

        var self = this;

        $.each(this.data, function() {
            var circle = new createjs.Shape();

            circle.name = 'Circle';
            circle.x = circle._x = this.x * self.ratioX;
            circle.y = circle._y = this.y * self.ratioY;
            circle.radius = circle._radius = this.radius * self.ratio;
            circle.scaleX = circle.scaleY = circle._scale = 1;
            circle.animating = false;

            circle.graphics
                .beginLinearGradientFill([self.options.colors.colorLightOpacity, self.options.colors.colorDarkOpacity], [1, 0], -circle._radius, 0, circle._radius, 0)
                .setStrokeStyle(0.5)
                .beginStroke(self.options.colors.colorLightOpacity)
                .drawCircle(0, 0, circle._radius);

            self.stage.addChild(circle);
        });
    };

    Tan.prototype.prepareScene = function() {
        var self = this;

        this.relations = [];
        this.canvas = document.getElementById('stage');
        this.stage = new createjs.Stage(this.canvas);

        this.config();
        this.addCircles();

        var renderScene = function() {
            if (!self.stage) { return; }

            requestAnimationFrame( renderScene );

            if (!self.linesCreated) {
                self.createLines();
            } else {
                $.each(self.circles, function() {
                    var circle = this;

                    if (!circle.animating) {
                        self.animateCircle(circle);
                    }
                });
            }
        };

        renderScene();
    };

    Tan.prototype.createLines = function() {
        if (!this.stage || this.linesCreated) { return; }

        var self = this;

        self.linesCreated = true;

        self.circles = $.grep(self.stage.children, function (e) {
            return e.name === 'Circle';
        });

        $.each(self.circles, function () {
            self.findTangents(this, self.circles);
        });

        self.lines = $.grep(self.stage.children, function (e) {
            return e.name === 'Line';
        });
    };

    Tan.prototype.animateCircle = function(circle) {
        if (!circle) { return; }

        circle.animating = true;

        var self = this,
            additionalValue = self.options.ratio * circle._radius;

        circle.animationParameters = {
            scale: self.getRandomNumber(-self.options.scale.min, self.options.scale.max, self.options.fractionalDigits),
            x: self.getRandomNumber(-self.options.positions.x.min * additionalValue, self.options.positions.x.max * additionalValue, self.options.fractionalDigits),
            y: self.getRandomNumber(-self.options.positions.y.min * additionalValue, self.options.positions.x.min * additionalValue, self.options.fractionalDigits)
        };

        circle.animation = createjs.Tween.get(circle, {
            override: true
        }).to({
            x: circle._x + circle.animationParameters.x,
            y: circle._y + circle.animationParameters.y,
            radius: circle._radius + circle._radius * circle.animationParameters.scale,
            scaleX: circle._scale + circle.animationParameters.scale,
            scaleY: circle._scale + circle.animationParameters.scale
        }, additionalValue * self.options.speed, self.options.easing).call(function () {
            circle.animation = createjs.Tween.get(circle, {
                override: true
            }).to({
                x: circle._x - circle.animationParameters.x,
                y: circle._y - circle.animationParameters.y,
                radius: circle._radius - circle._radius * circle.animationParameters.scale,
                scaleX: circle._scale - circle.animationParameters.scale,
                scaleY: circle._scale - circle.animationParameters.scale
            }, additionalValue * self.options.speed, self.options.easing).call(self.tweenComplete)
        });

        if (self.options.animationPaused) {
            circle.animation.setPaused(true);
        }
    };

    Tan.prototype.pauseAnimation = function() {
        if (!this.circles) { return; }

        $.each(this.circles, function () {
            this.animation.setPaused(true);
        });
    };

    Tan.prototype.resumeAnimation = function() {
        if (!this.circles) { return; }

        $.each(this.circles, function () {
            this.animation.setPaused(false);
        });
    };

    Tan.prototype.tweenComplete = function(e) {
        if (!e.target) { return; }
        e.target.animating = false;
    };

    Tan.prototype.getRandomNumber = function(from, to, tofxd) {
        if (!from || !to) { return; }

        var toFixed = tofxd || 0;

        return (toFixed == 0 ? parseInt((Math.random() * (to - from) + from).toFixed(toFixed)) : parseFloat((Math.random() * (to - from) + from).toFixed(toFixed)));
    };

    Tan.prototype.getTangents = function(x1, y1, r1, x2, y2, r2) {
        if (!x1 || !y1 || !r1 || !x2 || !y2 || !r2) { return; }

        var self = this,
            d_sq = parseFloat(((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)).toFixed(self.options.fractionalDigits)),
            d = parseFloat(Math.sqrt(d_sq)),
            vx = parseFloat(((x2 - x1) / d).toFixed(self.options.fractionalDigits)),
            vy = parseFloat(((y2 - y1) / d).toFixed(self.options.fractionalDigits)),
            res = [],
            i = 0;

        for (var sign1 = +1; sign1 >= -1; sign1 -= 2) {
            var c = parseFloat(((r1 - sign1 * r2) / d).toFixed(self.options.fractionalDigits)),
                c_sq = parseFloat((c * c).toFixed(self.options.fractionalDigits)),
                h = parseFloat(Math.sqrt(Math.max(0.0, 1.0 - c_sq)));

            if (c_sq > 1) return res;

            for (var sign2 = +1; sign2 >= -1; sign2 -= 2) {
                var nx = parseFloat((vx * c + sign2 * h * vy).toFixed(self.options.fractionalDigits)),
                    ny = parseFloat((vy * c - sign2 * h * vx).toFixed(self.options.fractionalDigits));

                res[i] = [];
                res[i].push(parseFloat((x1 + r1 * nx).toFixed(self.options.fractionalDigits)));
                res[i].push(parseFloat((y1 + r1 * ny).toFixed(self.options.fractionalDigits)));
                res[i].push(parseFloat((x2 + sign1 * r2 * nx).toFixed(self.options.fractionalDigits)));
                res[i].push(parseFloat((y2 + sign1 * r2 * ny).toFixed(self.options.fractionalDigits)));
                i++;
            }
        }

        return res;
    };

    Tan.prototype.findTangents = function(circle, circles) {
        if (!circle || !circles) { return; }

        var self = this,
            c1 = {
                x: circle.x,
                y: circle.y
            },
            r1 = circle.radius;

        $.each(circles, function() {
            var c = this;

            if (this.id === circle.id || $.grep(self.relations, function(e) { return (e.child_id === circle.id && e.parent_id === c.id); }).length > 0) { return; }

            var c2 = {
                    x: this.x,
                    y: this.y
                },
                r2 = this.radius,
                points = self.getTangents(c1.x, c1.y, r1, c2.x, c2.y, r2);

            if (!points.length) { return; }

            self.relations.push({
                child_id: this.id,
                parent_id: circle.id
            });

            $.each(points, function(i) {
                var line = new createjs.Shape();
                line.name = 'Line';
                line.lineIndex = i;

                line.parents = [];
                line.parents.push({
                    start: circle.id,
                    end: c.id
                });

                self.stage.addChild(line);
            });
        });
    };

    Tan.prototype.updateTangents = function(line) {
        if (!this.lines || !line) { return; }

        var self = this,
            circle1 = $.grep(self.circles, function (e) { return e.id === line.parents[0].start; })[0],
            circle2 = $.grep(self.circles, function (e) { return e.id === line.parents[0].end; })[0],
            points = self.getTangents(circle1.x, circle1.y, circle1.radius, circle2.x, circle2.y, circle2.radius);

        line.graphics.clear();

        if (!points[line.lineIndex]) { return; }

        var w = points[line.lineIndex][2] - points[line.lineIndex][0],
            h = points[line.lineIndex][3] - points[line.lineIndex][1],
            d = parseFloat(Math.sqrt(w * w + h * h).toFixed(self.options.fractionalDigits)),
            v = Math.max(0, Math.min(0, 1 - d/1000));

        line.graphics
            .setStrokeStyle(0.5)
            .beginLinearGradientStroke([self.options.colors.colorLightOpacity, self.options.colors.colorDark], [1, v], 0, 0, points[line.lineIndex][2], points[line.lineIndex][3])
            .moveTo(points[line.lineIndex][0], points[line.lineIndex][1])
            .lineTo(points[line.lineIndex][2], points[line.lineIndex][3]);
    };

    Tan.prototype.tick = function(event) {
        if (!Tangents.stage || !Tangents.lines) { return; }

        $.each(Tangents.lines, function () {
            Tangents.updateTangents(this);
        });

        Tangents.stage.update(event);
    };

    window.Tangents = new Tan();
}());