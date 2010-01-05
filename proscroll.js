/*
Copyright (c) 2010 Heath Padrick

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var ProScroll = (function(){
    var ProScroll = Class.create();
    
    ProScroll.Version = '0.0.2';
    
    ProScroll.keyPress = function(event){
    	if( event.keyCode === 18 && event.type === 'keydown' ) ProScroll.horiKey = true;
    	else ProScroll.horiKey = false;
    };
    
    ProScroll.horiKey = false;
    
    ProScroll.options = {
        axis: 'both', // horizontal, vertical or both
        trackClassName: 'scrollbar',
        handleClassName: 'scrollbar_handle'
    };
    
    ProScroll.prototype = {
        initialize: function(container, options){
            this.options = {};
            Object.extend(this.options, ProScroll.options);
            Object.extend(this.options, options || {});
            
            this.container = $(container)
            .setStyle({overflow: 'hidden'})
            .observe('mouse:wheel', function(ev){
            	ev.stop();
            	var slider = ProScroll.horiKey ? this.sliders.horizontal : this.sliders.vertical;            	
            	if(ev.memo.delta < 0) slider.setValue(slider.value + .1 );
            	else slider.setValue(slider.value - .1);
            }.bind(this));
            
            this.content = this.container.down();

            this.diff = this._calcDiff();
            
            this.sliders = this.createSliders();
        },
        
        /**
        * Inserts the sliders and returns them
        */
        createSliders: function(){
            var axis = [];
            if(this.options.axis === 'both') axis = ['vertical', 'horizontal'];
            else axis = [this.options.axis];
            var sliders = {};
            axis.each(function(a){
                sliders[a] = {
                    track: new Element('div').addClassName(a+'_'+this.options.trackClassName),
                    handle: new Element('div').addClassName(a+'_'+this.options.handleClassName)
                };
                this.container.insert(sliders[a].track.insert(sliders[a].handle));                
                sliders[a] = new Control.Slider(sliders[a].handle.identify(), sliders[a].track.identify(), {
                	axis: a,
                	onSlide: function(value){
                		this['_'+a+'Slide'](value);
                	}.bind(this),
                	onChange: function(value){
                		this['_'+a+'Slide'](value);
                	}.bind(this)
                });
            }.bind(this));
            return sliders;
        },
        
        _verticalSlide: function(value){
        	var top = (( Math.round(value * 10000)/10000) * this.diff.vertical).ceil();
        	this.content.setStyle({
        		top: '-'+top+'px'
        	});
        },
        
        _horizontalSlide: function(value){
        	var left = (( Math.round(value * 10000)/10000) * this.diff.horizontal).ceil();
        	this.content.setStyle({
        		left: '-'+left+'px'
        	});
        },
        
        _calcDiff: function(){
            var container = this.container.getDimensions();
            var content = this.content.getDimensions();
            var diff = {};
            diff.horizontal = (content.width - container.width).ceil();
            diff.vertical = (content.height - container.height).ceil();
            return diff;
        }
    };
    
    /**
     * mouse:wheel was taken from Livepipe UI
     * at http://livepipe.net/ and is under 
     * the MIT License 
     */
    (function(){
        function wheel(event){
            var delta, element, custom_event;
            // normalize the delta
            if (event.wheelDelta) { // IE & Opera
                delta = event.wheelDelta / 120;
            } else if (event.detail) { // W3C
                delta =- event.detail / 3;
            }
            if (!delta) { return; }
            element = Event.extend(event).target;
            element = Element.extend(element.nodeType === Node.TEXT_NODE ? element.parentNode : element);
            custom_event = element.fire('mouse:wheel',{ delta: delta });
            if (custom_event.stopped) {
                Event.stop(event);
                return false;
            }
        };
        document.observe('mousewheel',wheel);
        document.observe('DOMMouseScroll',wheel);
        document.observe('keydown', ProScroll.keyPress);
        document.observe('keyup', ProScroll.keyPress);
    })(); 
    
    return ProScroll;
})();