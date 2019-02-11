require 'webpacker'
require 'json'

ENV["NODE_ENV"] ||= "development"
ENV["RAILS_ENV"] ||= ENV["NODE_ENV"]

task :environment do
  # do nothing, purposefully
end

module Rails
  def self.root
    Pathname.new(File.expand_path(File.dirname(__FILE__)))
  end

  def self.env
    ENV["RAILS_ENV"]
  end
end

class Webpacker::Compiler
  def webpack_env
    env
  end
end

require 'active_support/all'

Dir[File.join(Gem::Specification.find_by_name("webpacker").gem_dir,
              "lib/tasks/**/*.rake")].each do |task|
  load task
end
